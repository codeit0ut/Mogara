from datetime import date

from fastapi import APIRouter, Query

from app.api.deps import QuickNoteServiceDep
from app.schemas import QuickNoteCreate, QuickNoteOut, QuickNoteUpdate

router = APIRouter(prefix="/quick-notes", tags=["quick-notes"])


@router.get("", response_model=list[QuickNoteOut])
def list_quick_notes(
    service: QuickNoteServiceDep,
    note_date: date | None = Query(None),
    include_deleted: bool = False,
):
    return service.list_all(note_date=note_date, include_deleted=include_deleted)


@router.get("/{note_id}", response_model=QuickNoteOut)
def get_quick_note(note_id: int, service: QuickNoteServiceDep):
    return service.get(note_id)


@router.post("", response_model=QuickNoteOut, status_code=201)
def create_quick_note(body: QuickNoteCreate, service: QuickNoteServiceDep):
    return service.create(body)


@router.patch("/{note_id}", response_model=QuickNoteOut)
def update_quick_note(
    note_id: int, body: QuickNoteUpdate, service: QuickNoteServiceDep
):
    return service.update(note_id, body)


@router.delete("/{note_id}", status_code=204)
def delete_quick_note(
    note_id: int,
    service: QuickNoteServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(note_id, delete_reason)
