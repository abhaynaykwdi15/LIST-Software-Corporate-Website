from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    database_url: str = "sqlite:///./list_software.db"
    secret_key: str = Field(min_length=32)
    admin_email: str = ""
    admin_password: str = ""
    cors_origins: str = "http://localhost:5173"
    upload_dir: str = "uploads/resumes"
    max_upload_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("secret_key")
    @classmethod
    def reject_example_secret(cls, value: str) -> str:
        if "replace-with" in value.lower() or "generate-a-" in value.lower():
            raise ValueError("Replace the example SECRET_KEY with a unique random value.")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
