import os
import tempfile
import unittest

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-only-secret-key-0123456789-abcdefgh"
os.environ["ADMIN_EMAIL"] = ""
os.environ["ADMIN_PASSWORD"] = ""

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.database import Base, get_db
from app.main import app


class ApplicationValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.session_factory = sessionmaker(bind=cls.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def setUp(self):
        def override_get_db():
            with self.session_factory() as db:
                yield db

        self.upload_dir = tempfile.TemporaryDirectory()
        self.original_upload_dir = settings.upload_dir
        settings.upload_dir = self.upload_dir.name
        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        app.dependency_overrides.clear()
        settings.upload_dir = self.original_upload_dir
        self.upload_dir.cleanup()

    def test_invalid_phone_returns_serializable_422_without_echoing_input(self):
        response = self.client.post(
            "/api/applications",
            data={
                "job_id": "1",
                "full_name": "Test Candidate",
                "email": "candidate@example.com",
                "phone": "not-a-phone",
                "qualification": "Degree",
                "experience": "3 years",
                "current_location": "Kolhapur",
                "skills": "Python",
                "consent_given": "true",
            },
            files={"resume": ("resume.pdf", b"%PDF-1.4\nTest", "application/pdf")},
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("Enter a valid phone number.", response.text)
        self.assertNotIn("not-a-phone", response.text)
