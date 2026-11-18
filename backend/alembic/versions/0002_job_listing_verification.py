"""Add source-backed job listing status."""

from alembic import op
import sqlalchemy as sa

revision = "0002_job_listing_verification"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    existing_columns = {column["name"] for column in sa.inspect(bind).get_columns("jobs")}
    if "listing_status" not in existing_columns:
        op.add_column(
            "jobs",
            sa.Column("listing_status", sa.String(length=30), server_default="illustrative", nullable=False),
        )
    if "listing_source" not in existing_columns:
        op.add_column("jobs", sa.Column("listing_source", sa.String(length=500), nullable=True))
    if "listing_date" not in existing_columns:
        op.add_column("jobs", sa.Column("listing_date", sa.Date(), nullable=True))

    role_profiles = [
        (
            "Software Engineer — Banking Platforms",
            "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. Example duties are informed by the company’s published core banking and connected banking product areas, but are not a company-authored job specification.",
            "Develop and maintain example capabilities for banking workflows and connected services.\nCollaborate with quality assurance and implementation teams to clarify requirements.\nWrite maintainable code, review changes and investigate defects.",
            "Experience with a programming language and relational databases.\nUnderstanding of APIs and software development practices.\nClear communication and collaborative problem-solving.",
        ),
        (
            "Quality Assurance Engineer",
            "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. The example focuses on quality practices suitable for business-critical banking software and should not be read as a company-authored job specification.",
            "Create and execute functional and regression scenarios for banking workflows.\nRecord defects with clear steps and expected outcomes.\nWork with engineering and implementation teams to verify fixes.",
            "Test planning and careful documentation.\nBasic SQL and web/API testing concepts.\nAnalytical thinking and clear written communication.",
        ),
        (
            "Implementation & Support Associate",
            "Illustrative role profile only; this is not a LIST Software advertisement or a currently verified vacancy. It reflects the company’s public description of banking software and customer support, but is not a company-authored job specification.",
            "Help prepare and document example software implementation activities.\nAssist in recording customer questions and troubleshooting information.\nCoordinate with internal teams and communicate progress clearly.",
            "Customer communication and organized documentation.\nStructured troubleshooting and willingness to learn banking workflows.\nBasic database or software support familiarity is useful.",
        ),
    ]
    for title, description, responsibilities, skills in role_profiles:
        bind.execute(
            sa.text(
                "UPDATE jobs SET listing_status = 'illustrative', listing_source = NULL, listing_date = NULL, "
                "description = :description, responsibilities = :responsibilities, skills = :skills, "
                "availability_note = 'Illustrative role profile only — not a historical advertisement; no current vacancy verified.' "
                "WHERE title = :title AND (availability_note LIKE '%demo%' OR availability_note LIKE '%unverified%')"
            ),
            {
                "title": title,
                "description": description,
                "responsibilities": responsibilities,
                "skills": skills,
            },
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing_columns = {column["name"] for column in sa.inspect(bind).get_columns("jobs")}
    for column_name in ("listing_date", "listing_source", "listing_status"):
        if column_name in existing_columns:
            op.drop_column("jobs", column_name)
