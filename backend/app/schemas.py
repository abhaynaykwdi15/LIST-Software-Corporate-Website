from datetime import date
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class AdminCredentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class JobInput(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    department: str = Field(min_length=2, max_length=100)
    employment_type: str = Field(min_length=2, max_length=60)
    experience: str = Field(min_length=2, max_length=100)
    location: str = Field(min_length=2, max_length=160)
    summary: str = Field(min_length=10, max_length=320)
    description: str = Field(min_length=20, max_length=10000)
    responsibilities: str = Field(default="", max_length=10000)
    skills: str = Field(default="", max_length=3000)
    qualification: str = Field(default="", max_length=3000)
    availability_note: str = Field(default="Demonstration listing; availability unverified.", max_length=255)
    listing_status: Literal["illustrative", "historical", "current_verified"] = "illustrative"
    listing_source: str | None = Field(default=None, max_length=500)
    listing_date: date | None = None
    is_published: bool = False

    @field_validator("listing_source", mode="before")
    @classmethod
    def empty_source_is_none(cls, value: str | None) -> str | None:
        return value.strip() or None if isinstance(value, str) else value

    @field_validator("listing_source")
    @classmethod
    def validate_listing_source(cls, value: str | None) -> str | None:
        if value is None:
            return None
        parsed = urlsplit(value)
        if parsed.scheme != "https" or parsed.hostname not in {"listspl.co.in", "www.listspl.co.in"}:
            raise ValueError("Use a source URL from the official listspl.co.in website.")
        return value

    @field_validator("listing_date", mode="before")
    @classmethod
    def empty_date_is_none(cls, value: date | str | None) -> date | str | None:
        return value or None

    @model_validator(mode="after")
    def validate_listing_evidence(self):
        if self.listing_status in {"historical", "current_verified"}:
            if not self.listing_source or not self.listing_date:
                raise ValueError("Historical and currently verified listings require an official source URL and date.")
        if self.listing_status == "current_verified" and self.listing_date and self.listing_date > date.today():
            raise ValueError("The verification date cannot be in the future.")
        return self


class JobResponse(JobInput):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ApplicationInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    qualification: str = Field(min_length=2, max_length=200)
    experience: str = Field(min_length=1, max_length=100)
    current_location: str = Field(min_length=2, max_length=160)
    skills: str = Field(min_length=2, max_length=3000)
    cover_letter: str = Field(default="", max_length=5000)
    consent_given: bool

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if not 7 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number.")
        return value


class ContactInput(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    message: str = Field(min_length=10, max_length=5000)


class ApplicationStatusInput(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        allowed = {"received", "reviewing", "shortlisted", "rejected", "hired"}
        if value not in allowed:
            raise ValueError("Choose a valid application status.")
        return value
