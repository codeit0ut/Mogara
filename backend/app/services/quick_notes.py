from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.time import utc_now
from app.models import QuickNote
from app.schemas import QuickNoteCreate, QuickNoteUpdate
from app.services.base import apply_update, soft_delete


class QuickNoteService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_all(
        self, note_date: date | None = None, include_deleted: bool = False
    ) -> list[QuickNote]:
        q = self.db.query(QuickNote).filter(QuickNote.user_id == self.user_id)
        if not include_deleted:
            q = q.filter(QuickNote.is_deleted.is_(False))
        if note_date is not None:
            q = q.filter(QuickNote.note_date == note_date)
        return q.order_by(QuickNote.id.desc()).all()

    def get(self, note_id: int) -> QuickNote:
        note = (
            self.db.query(QuickNote)
            .filter(QuickNote.id == note_id, QuickNote.user_id == self.user_id)
            .first()
        )
        if not note or note.is_deleted:
            raise NotFoundError("Quick note not found")
        return note

    def create(self, data: QuickNoteCreate) -> QuickNote:
        now = utc_now()
        note = QuickNote(
            **data.model_dump(),
            user_id=self.user_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def update(self, note_id: int, data: QuickNoteUpdate) -> QuickNote:
        note = self.get(note_id)
        apply_update(note, data.model_dump(exclude_unset=True))
        self.db.commit()
        self.db.refresh(note)
        return note

    def delete(self, note_id: int, delete_reason: str | None = None) -> None:
        note = self.get(note_id)
        soft_delete(note, delete_reason)
        self.db.commit()
