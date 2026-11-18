import re
import uuid
import zipfile
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.models import AdminUser, Applicant, ContactMessage, Job, JobApplication, JobCategory
from app.schemas import (
    AdminCredentials,
    ApplicationInput,
    ApplicationStatusInput,
    ContactInput,
    JobInput,
    JobResponse,
    TokenResponse,
)
from app.security import create_access_token, decode_subject, hash_password, verify_password

app = FastAPI(title="LIST Software Demo API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

bearer = HTTPBearer()
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
RESUME_STATUSES = {"received", "reviewing", "shortlisted", "rejected", "hired"}


def current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> AdminUser:
    email = decode_subject(credentials.credentials)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")
    admin = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if admin is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin account not found.")
    return admin


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: AdminCredentials, db: Session = Depends(get_db)):
    admin = db.scalar(select(AdminUser).where(AdminUser.email == str(credentials.email).lower()))
    if admin is None or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect.")
    return TokenResponse(access_token=create_access_token(admin.email))


@app.get("/api/jobs", response_model=list[JobResponse])
def list_jobs(
    department: str | None = None,
    experience: str | None = None,
    employment_type: str | None = None,
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    query = select(Job).where(Job.is_published.is_(True))
    if department:
        query = query.where(Job.department == department)
    if experience:
        query = query.where(Job.experience == experience)
    if employment_type:
        query = query.where(Job.employment_type == employment_type)
    if q:
        term = f"%{q.strip()}%"
        query = query.where(or_(Job.title.ilike(term), Job.department.ilike(term), Job.summary.ilike(term)))
    return db.scalars(query.order_by(Job.created_at.desc())).all()


@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None or not job.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job listing not found.")
    return job


@app.post("/api/applications", status_code=status.HTTP_201_CREATED)
async def submit_application(
    job_id: int = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    qualification: str = Form(...),
    experience: str = Form(...),
    current_location: str = Form(...),
    skills: str = Form(...),
    cover_letter: str = Form(""),
    consent_given: bool = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        applicant_data = ApplicationInput(
            full_name=full_name,
            email=email,
            phone=phone,
            qualification=qualification,
            experience=experience,
            current_location=current_location,
            skills=skills,
            cover_letter=cover_letter,
            consent_given=consent_given,
        )
    except ValidationError as exc:
        errors = exc.errors(include_url=False, include_context=False, include_input=False)
        raise HTTPException(status_code=422, detail=errors) from exc
    if not applicant_data.consent_given:
        raise HTTPException(status_code=422, detail="Privacy consent is required.")

    job = db.get(Job, job_id)
    if job is None or not job.is_published:
        raise HTTPException(status_code=404, detail="This job is no longer available.")
    if job.listing_status == "historical":
        raise HTTPException(status_code=409, detail="This historical advertisement is closed and is not accepting applications.")

    extension = Path(resume.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF, DOC or DOCX resume.")

    upload_dir = Path(settings.upload_dir).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{extension}"
    stored_path = upload_dir / stored_name
    size = 0
    signature = b""
    try:
        with stored_path.open("wb") as target:
            while chunk := await resume.read(64 * 1024):
                size += len(chunk)
                if size > settings.max_upload_bytes:
                    raise HTTPException(status_code=413, detail="Resume must be 10 MB or smaller.")
                if len(signature) < 8:
                    signature += chunk[: 8 - len(signature)]
                target.write(chunk)
        if size == 0 or not _valid_resume_signature(extension, signature, stored_path):
            raise HTTPException(status_code=400, detail="The uploaded file does not match its file type.")

        applicant = Applicant(
            full_name=applicant_data.full_name,
            email=str(applicant_data.email),
            phone=applicant_data.phone,
            qualification=applicant_data.qualification,
            experience=applicant_data.experience,
            current_location=applicant_data.current_location,
            skills=applicant_data.skills,
        )
        db.add(applicant)
        db.flush()
        db.add(
            JobApplication(
                applicant_id=applicant.id,
                job_id=job.id,
                cover_letter=applicant_data.cover_letter,
                resume_filename=_safe_filename(resume.filename),
                resume_path=str(stored_path),
                consent_given=True,
            )
        )
        db.commit()
        return {"message": "Application received. Thank you for your interest."}
    except Exception:
        if stored_path.exists():
            stored_path.unlink()
        raise
    finally:
        await resume.close()


def _valid_resume_signature(extension: str, signature: bytes, path: Path) -> bool:
    if extension == ".pdf":
        return signature.startswith(b"%PDF-")
    if extension == ".doc":
        return signature.startswith(bytes.fromhex("D0CF11E0A1B11AE1"))
    if not signature.startswith(b"PK"):
        return False
    try:
        with zipfile.ZipFile(path) as archive:
            return "word/document.xml" in archive.namelist()
    except zipfile.BadZipFile:
        return False


def _safe_filename(filename: str | None) -> str:
    safe = Path(filename or "resume").name
    return re.sub(r"[^A-Za-z0-9._ -]", "_", safe)[:200] or "resume"


@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactInput, db: Session = Depends(get_db)):
    message = ContactMessage(
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        message=payload.message,
    )
    db.add(message)
    db.commit()
    return {"message": "Your enquiry has been received."}


@app.get("/api/admin/dashboard")
def dashboard_stats(_: AdminUser = Depends(current_admin), db: Session = Depends(get_db)):
    return {
        "jobs": db.scalar(select(func.count(Job.id))) or 0,
        "published_jobs": db.scalar(select(func.count(Job.id)).where(Job.is_published.is_(True))) or 0,
        "applications": db.scalar(select(func.count(JobApplication.id))) or 0,
        "new_applications": db.scalar(
            select(func.count(JobApplication.id)).where(JobApplication.status == "received")
        )
        or 0,
        "enquiries": db.scalar(select(func.count(ContactMessage.id))) or 0,
    }


@app.get("/api/admin/jobs", response_model=list[JobResponse])
def admin_jobs(_: AdminUser = Depends(current_admin), db: Session = Depends(get_db)):
    return db.scalars(select(Job).order_by(Job.created_at.desc())).all()


@app.post("/api/admin/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobInput, _: AdminUser = Depends(current_admin), db: Session = Depends(get_db)):
    category = db.scalar(select(JobCategory).where(JobCategory.name == payload.department))
    if category is None:
        category = JobCategory(name=payload.department)
        db.add(category)
        db.flush()
    job = Job(**payload.model_dump(), category_id=category.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@app.put("/api/admin/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    payload: JobInput,
    _: AdminUser = Depends(current_admin),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job listing not found.")
    category = db.scalar(select(JobCategory).where(JobCategory.name == payload.department))
    if category is None:
        category = JobCategory(name=payload.department)
        db.add(category)
        db.flush()
    for field, value in payload.model_dump().items():
        setattr(job, field, value)
    job.category_id = category.id
    db.commit()
    db.refresh(job)
    return job


@app.delete("/api/admin/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, _: AdminUser = Depends(current_admin), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job listing not found.")
    if db.scalar(select(func.count(JobApplication.id)).where(JobApplication.job_id == job_id)):
        raise HTTPException(status_code=409, detail="This job has applications and cannot be deleted.")
    db.delete(job)
    db.commit()


@app.get("/api/admin/applications")
def list_applications(
    q: str | None = Query(default=None, max_length=100),
    application_status: str | None = Query(default=None, alias="status"),
    job_id: int | None = None,
    _: AdminUser = Depends(current_admin),
    db: Session = Depends(get_db),
):
    query = select(JobApplication).options(joinedload(JobApplication.applicant), joinedload(JobApplication.job))
    if q:
        term = f"%{q.strip()}%"
        query = query.join(JobApplication.applicant).where(
            or_(Applicant.full_name.ilike(term), Applicant.email.ilike(term), Applicant.skills.ilike(term))
        )
    if application_status:
        if application_status not in RESUME_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid application status filter.")
        query = query.where(JobApplication.status == application_status)
    if job_id:
        query = query.where(JobApplication.job_id == job_id)
    applications = db.scalars(query.order_by(JobApplication.created_at.desc())).unique().all()
    return [
        {
            "id": item.id,
            "name": item.applicant.full_name,
            "email": item.applicant.email,
            "phone": item.applicant.phone,
            "job_title": item.job.title,
            "job_id": item.job.id,
            "qualification": item.applicant.qualification,
            "experience": item.applicant.experience,
            "location": item.applicant.current_location,
            "skills": item.applicant.skills,
            "cover_letter": item.cover_letter,
            "resume_filename": item.resume_filename,
            "status": item.status,
            "created_at": item.created_at,
        }
        for item in applications
    ]


@app.patch("/api/admin/applications/{application_id}")
def update_application_status(
    application_id: int,
    payload: ApplicationStatusInput,
    _: AdminUser = Depends(current_admin),
    db: Session = Depends(get_db),
):
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    application.status = payload.status
    db.commit()
    return {"message": "Application status updated."}


@app.get("/api/admin/applications/{application_id}/resume")
def download_resume(
    application_id: int,
    _: AdminUser = Depends(current_admin),
    db: Session = Depends(get_db),
):
    from fastapi.responses import FileResponse

    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    path = Path(application.resume_path).resolve()
    upload_root = Path(settings.upload_dir).resolve()
    if upload_root not in path.parents or not path.is_file():
        raise HTTPException(status_code=404, detail="Resume file not found.")
    return FileResponse(path, filename=application.resume_filename, media_type="application/octet-stream")


@app.get("/api/admin/contacts")
def list_contact_messages(_: AdminUser = Depends(current_admin), db: Session = Depends(get_db)):
    messages = db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc())).all()
    return [
        {"id": message.id, "name": message.name, "email": message.email, "phone": message.phone,
         "message": message.message, "created_at": message.created_at}
        for message in messages
    ]


def bootstrap_admin() -> None:
    if not settings.admin_email and not settings.admin_password:
        return
    if not settings.admin_email or not settings.admin_password or len(settings.admin_password) < 12:
        raise RuntimeError("Set both ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.")
    db = next(get_db())
    try:
        email = settings.admin_email.lower().strip()
        existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing is None:
            db.add(AdminUser(email=email, password_hash=hash_password(settings.admin_password)))
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    bootstrap_admin()
