"""Create recruitment schema and sample demonstration roles."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from datetime import datetime, timezone

from app.database import Base
from app import models

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)
    categories = table("job_categories", column("id", sa.Integer), column("name", sa.String))
    jobs = table(
        "jobs",
        column("title", sa.String),
        column("department", sa.String),
        column("employment_type", sa.String),
        column("experience", sa.String),
        column("location", sa.String),
        column("summary", sa.String),
        column("description", sa.Text),
        column("responsibilities", sa.Text),
        column("skills", sa.Text),
        column("qualification", sa.Text),
        column("availability_note", sa.String),
        column("is_published", sa.Boolean),
        column("category_id", sa.Integer),
        column("created_at", sa.DateTime(timezone=True)),
    )
    category_id = bind.execute(
        sa.select(categories.c.id).where(categories.c.name == "Engineering")
    ).scalar()
    if category_id is None:
        bind.execute(categories.insert().values(name="Engineering"))
        category_id = bind.execute(
            sa.select(categories.c.id).where(categories.c.name == "Engineering")
        ).scalar_one()
    demonstration_roles = [
        {
            "title": "Software Engineer — Banking Platforms",
            "department": "Engineering",
            "employment_type": "Full-time",
            "experience": "2–5 years",
            "location": "Kolhapur, Maharashtra",
            "summary": "A sample role for building reliable software that supports cooperative banking workflows.",
            "description": "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. Example duties are informed by the company’s published core banking and connected banking product areas, but are not a company-authored job specification.",
            "responsibilities": "Develop and maintain example capabilities for banking workflows and connected services.\nCollaborate with quality assurance and implementation teams to clarify requirements.\nWrite maintainable code, review changes and investigate defects.",
            "skills": "Experience with a programming language and relational databases.\nUnderstanding of APIs and software development practices.\nClear communication and collaborative problem-solving.",
            "qualification": "A relevant degree or equivalent practical experience; specific requirements would need confirmation in an official advertisement.",
            "availability_note": "Illustrative role profile only — not a historical advertisement; no current vacancy verified.",
            "is_published": True,
            "category_id": category_id,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "title": "Quality Assurance Engineer",
            "department": "Quality Assurance",
            "employment_type": "Full-time",
            "experience": "1–4 years",
            "location": "Kolhapur, Maharashtra",
            "summary": "A sample role focused on testing business-critical banking software.",
            "description": "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. The example focuses on quality practices suitable for business-critical banking software and should not be read as a company-authored job specification.",
            "responsibilities": "Create and execute functional and regression scenarios for banking workflows.\nRecord defects with clear steps and expected outcomes.\nWork with engineering and implementation teams to verify fixes.",
            "skills": "Test planning and careful documentation.\nBasic SQL and web/API testing concepts.\nAnalytical thinking and clear written communication.",
            "qualification": "A relevant degree or equivalent practical experience; specific requirements would need confirmation in an official advertisement.",
            "availability_note": "Illustrative role profile only — not a historical advertisement; no current vacancy verified.",
            "is_published": True,
            "category_id": category_id,
        },
        {
            "title": "Implementation & Support Associate",
            "department": "Customer Success",
            "employment_type": "Full-time",
            "experience": "0–3 years",
            "location": "Kolhapur, Maharashtra",
            "summary": "A sample role supporting implementation and customer service workflows.",
            "description": "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. It reflects the company’s public description of banking software and customer support, but is not a company-authored job specification.",
            "responsibilities": "Help prepare and document example software implementation activities.\nAssist in recording customer questions and troubleshooting information.\nCoordinate with internal teams and communicate progress clearly.",
            "skills": "Customer communication and organized documentation.\nStructured troubleshooting and willingness to learn banking workflows.\nBasic database or software support familiarity is useful.",
            "qualification": "A relevant degree or equivalent practical experience; specific requirements would need confirmation in an official advertisement.",
            "availability_note": "Illustrative role profile only — not a historical advertisement; no current vacancy verified.",
            "is_published": True,
            "category_id": category_id,
        },
    ]
    for role in demonstration_roles:
        exists = bind.execute(sa.select(jobs.c.title).where(jobs.c.title == role["title"])).first()
        if exists is None:
            role.setdefault("created_at", datetime.now(timezone.utc))
            bind.execute(jobs.insert().values(**role))


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text(
            "DELETE FROM jobs WHERE availability_note = "
            "'Independent demo listing — not an official vacancy; availability unverified.'"
        )
    )
    Base.metadata.drop_all(bind=bind)
