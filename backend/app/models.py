from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class JobCategory(Base):
    __tablename__ = "job_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    jobs: Mapped[list["Job"]] = relationship(back_populates="category")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    department: Mapped[str] = mapped_column(String(100), index=True)
    employment_type: Mapped[str] = mapped_column(String(60))
    experience: Mapped[str] = mapped_column(String(100))
    location: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(String(320))
    description: Mapped[str] = mapped_column(Text)
    responsibilities: Mapped[str] = mapped_column(Text, default="")
    skills: Mapped[str] = mapped_column(Text, default="")
    qualification: Mapped[str] = mapped_column(Text, default="")
    availability_note: Mapped[str] = mapped_column(String(255), default="Demonstration listing; availability unverified.")
    listing_status: Mapped[str] = mapped_column(String(30), default="illustrative", server_default="illustrative")
    listing_source: Mapped[str | None] = mapped_column(String(500), nullable=True)
    listing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("job_categories.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    category: Mapped[JobCategory | None] = relationship(back_populates="jobs")
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="job")


class Applicant(Base):
    __tablename__ = "applicants"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    email: Mapped[str] = mapped_column(String(254), index=True)
    phone: Mapped[str] = mapped_column(String(30))
    qualification: Mapped[str] = mapped_column(String(200))
    experience: Mapped[str] = mapped_column(String(100))
    current_location: Mapped[str] = mapped_column(String(160))
    skills: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="applicant")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    applicant_id: Mapped[int] = mapped_column(ForeignKey("applicants.id"))
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    cover_letter: Mapped[str] = mapped_column(Text, default="")
    resume_filename: Mapped[str] = mapped_column(String(255))
    resume_path: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(40), default="received", index=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    applicant: Mapped[Applicant] = relationship(back_populates="applications")
    job: Mapped[Job] = relationship(back_populates="applications")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(254))
    phone: Mapped[str] = mapped_column(String(30), default="")
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
