import os
import tempfile
import unittest
import zipfile
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "workflow-test-secret-key-0123456789-abcdefgh"
os.environ["ADMIN_EMAIL"] = ""
os.environ["ADMIN_PASSWORD"] = ""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models import AdminUser, Job
from app.security import hash_password


class APIWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.session_factory = sessionmaker(bind=cls.engine, autoflush=False, autocommit=False)

    def setUp(self):
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        self.upload_dir = tempfile.TemporaryDirectory()
        self.original_upload_dir = settings.upload_dir
        settings.upload_dir = self.upload_dir.name

        def override_get_db():
            with self.session_factory() as db:
                yield db

        app.dependency_overrides[get_db] = override_get_db
        with self.session_factory() as db:
            db.add(AdminUser(email="admin@example.com", password_hash=hash_password("TemporaryTestPassword123!")))
            self.job = Job(
                title="Test Software Engineer",
                department="Engineering",
                employment_type="Full-time",
                experience="2–5 years",
                location="Kolhapur",
                summary="An illustrative role for API workflow testing.",
                description="This role exists only for isolated API workflow tests.",
                responsibilities="Write and test software",
                skills="Python, SQL",
                qualification="Relevant degree",
                listing_status="illustrative",
                availability_note="Test role; not a vacancy.",
                is_published=True,
            )
            db.add(self.job)
            db.commit()
            self.job_id = self.job.id

        self.client = TestClient(app)
        self.client.__enter__()
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@example.com", "password": "TemporaryTestPassword123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.auth = {"Authorization": f"Bearer {response.json()['access_token']}"}

    def tearDown(self):
        self.client.__exit__(None, None, None)
        app.dependency_overrides.clear()
        settings.upload_dir = self.original_upload_dir
        self.upload_dir.cleanup()

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def application_form(self):
        return {
            "job_id": str(self.job_id),
            "full_name": "Test Candidate",
            "email": "candidate@example.com",
            "phone": "+91 9876543210",
            "qualification": "B.Tech",
            "experience": "3 years",
            "current_location": "Kolhapur",
            "skills": "Python, SQL",
            "cover_letter": "Interested in this illustrative role.",
            "consent_given": "true",
        }

    def test_job_crud_and_publish_state(self):
        listed = self.client.get("/api/jobs")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual([job["id"] for job in listed.json()], [self.job_id])

        job = listed.json()[0]
        job["title"] = "Updated Test Engineer"
        job["is_published"] = False
        updated = self.client.put(f"/api/admin/jobs/{self.job_id}", json=job, headers=self.auth)
        self.assertEqual(updated.status_code, 200, updated.text)
        self.assertEqual(updated.json()["title"], "Updated Test Engineer")
        self.assertEqual(self.client.get("/api/jobs").json(), [])

        job = updated.json()
        job["is_published"] = True
        published = self.client.put(f"/api/admin/jobs/{self.job_id}", json=job, headers=self.auth)
        self.assertEqual(published.status_code, 200, published.text)
        self.assertEqual(len(self.client.get("/api/jobs").json()), 1)

        created = self.client.post(
            "/api/admin/jobs",
            json={**job, "title": "Another Test Role", "is_published": False},
            headers=self.auth,
        )
        self.assertEqual(created.status_code, 201, created.text)
        deleted = self.client.delete(f"/api/admin/jobs/{created.json()['id']}", headers=self.auth)
        self.assertEqual(deleted.status_code, 204)

    def test_application_resume_contact_and_dashboard_workflow(self):
        response = self.client.post(
            "/api/applications",
            data=self.application_form(),
            files={"resume": ("candidate.pdf", b"%PDF-1.4\nTest resume content", "application/pdf")},
        )
        self.assertEqual(response.status_code, 201, response.text)

        applications = self.client.get("/api/admin/applications", headers=self.auth)
        self.assertEqual(applications.status_code, 200, applications.text)
        application = applications.json()[0]
        self.assertEqual(application["email"], "candidate@example.com")
        self.assertEqual(application["job_id"], self.job_id)

        updated = self.client.patch(
            f"/api/admin/applications/{application['id']}",
            json={"status": "reviewing"},
            headers=self.auth,
        )
        self.assertEqual(updated.status_code, 200, updated.text)

        resume = self.client.get(
            f"/api/admin/applications/{application['id']}/resume",
            headers=self.auth,
        )
        self.assertEqual(resume.status_code, 200)
        self.assertTrue(resume.content.startswith(b"%PDF-"))

        invalid_resume = self.client.post(
            "/api/applications",
            data={**self.application_form(), "email": "another@example.com"},
            files={"resume": ("fake.pdf", b"not a PDF", "application/pdf")},
        )
        self.assertEqual(invalid_resume.status_code, 400)
        stored_resumes = list(Path(self.upload_dir.name).iterdir())
        self.assertEqual(len(stored_resumes), 1)
        self.assertEqual(stored_resumes[0].suffix, ".pdf")

        contact = self.client.post(
            "/api/contact",
            json={
                "name": "Demo Enquiry",
                "email": "contact@example.com",
                "phone": "",
                "message": "A test contact enquiry for the API workflow.",
            },
        )
        self.assertEqual(contact.status_code, 201, contact.text)
        self.assertEqual(len(self.client.get("/api/admin/contacts", headers=self.auth).json()), 1)

        dashboard = self.client.get("/api/admin/dashboard", headers=self.auth)
        self.assertEqual(dashboard.status_code, 200, dashboard.text)
        self.assertEqual(dashboard.json()["applications"], 1)
        self.assertEqual(dashboard.json()["new_applications"], 0)
        self.assertEqual(dashboard.json()["enquiries"], 1)

        protected_delete = self.client.delete(f"/api/admin/jobs/{self.job_id}", headers=self.auth)
        self.assertEqual(protected_delete.status_code, 409)

    def test_docx_resume_upload_and_authentication(self):
        document = tempfile.NamedTemporaryFile(suffix=".docx", delete=False)
        document.close()
        try:
            with zipfile.ZipFile(document.name, "w") as archive:
                archive.writestr("word/document.xml", "<document/>")
            with open(document.name, "rb") as resume_file:
                response = self.client.post(
                    "/api/applications",
                    data=self.application_form(),
                    files={
                        "resume": (
                            "candidate.docx",
                            resume_file.read(),
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        )
                    },
                )
            self.assertEqual(response.status_code, 201, response.text)
        finally:
            Path(document.name).unlink(missing_ok=True)

        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 403)
        wrong_password = self.client.post(
            "/api/auth/login",
            json={"email": "admin@example.com", "password": "WrongPassword123!"},
        )
        self.assertEqual(wrong_password.status_code, 401)
