from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.time import utc_now
from app.models import NoteTemplate
from app.schemas import NoteTemplateCreate, NoteTemplateUpdate
from app.services.base import apply_update, soft_delete


class NoteTemplateService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_all(self, include_deleted: bool = False) -> list[NoteTemplate]:
        q = self.db.query(NoteTemplate).filter(NoteTemplate.user_id == self.user_id)
        if not include_deleted:
            q = q.filter(NoteTemplate.is_deleted.is_(False))
        return q.order_by(NoteTemplate.title.asc()).all()

    def get(self, template_id: int) -> NoteTemplate:
        row = (
            self.db.query(NoteTemplate)
            .filter(NoteTemplate.id == template_id, NoteTemplate.user_id == self.user_id)
            .first()
        )
        if not row or row.is_deleted:
            raise NotFoundError("Note template not found")
        return row

    def create(self, data: NoteTemplateCreate) -> NoteTemplate:
        title = data.title.strip()
        body = data.body.strip()
        if not title:
            raise ConflictError("Template title is required")
        if not body:
            raise ConflictError("Template body is required")
        existing = (
            self.db.query(NoteTemplate)
            .filter(
                NoteTemplate.user_id == self.user_id,
                NoteTemplate.title == title,
                NoteTemplate.is_deleted.is_(False),
            )
            .first()
        )
        if existing:
            raise ConflictError("A template with this name already exists")
        now = utc_now()
        row = NoteTemplate(
            title=title,
            body=body,
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def update(self, template_id: int, data: NoteTemplateUpdate) -> NoteTemplate:
        row = self.get(template_id)
        payload = data.model_dump(exclude_unset=True)
        if "title" in payload and payload["title"] is not None:
            payload["title"] = payload["title"].strip()
            if not payload["title"]:
                raise ConflictError("Template title is required")
            clash = (
                self.db.query(NoteTemplate)
                .filter(
                    NoteTemplate.user_id == self.user_id,
                    NoteTemplate.title == payload["title"],
                    NoteTemplate.id != template_id,
                    NoteTemplate.is_deleted.is_(False),
                )
                .first()
            )
            if clash:
                raise ConflictError("A template with this name already exists")
        if "body" in payload and payload["body"] is not None:
            payload["body"] = payload["body"].strip()
            if not payload["body"]:
                raise ConflictError("Template body is required")
        apply_update(row, payload)
        self.db.commit()
        self.db.refresh(row)
        return row

    def delete(self, template_id: int, delete_reason: str | None = None) -> None:
        row = self.get(template_id)
        soft_delete(row, delete_reason)
        self.db.commit()
