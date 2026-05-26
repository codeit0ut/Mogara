from fastapi import APIRouter, Query

from app.api.deps import NoteTemplateServiceDep
from app.schemas import NoteTemplateCreate, NoteTemplateOut, NoteTemplateUpdate

router = APIRouter(prefix="/note-templates", tags=["note-templates"])


@router.get("", response_model=list[NoteTemplateOut])
def list_note_templates(
    service: NoteTemplateServiceDep,
    include_deleted: bool = False,
):
    return service.list_all(include_deleted=include_deleted)


@router.get("/{template_id}", response_model=NoteTemplateOut)
def get_note_template(template_id: int, service: NoteTemplateServiceDep):
    return service.get(template_id)


@router.post("", response_model=NoteTemplateOut, status_code=201)
def create_note_template(body: NoteTemplateCreate, service: NoteTemplateServiceDep):
    return service.create(body)


@router.patch("/{template_id}", response_model=NoteTemplateOut)
def update_note_template(
    template_id: int, body: NoteTemplateUpdate, service: NoteTemplateServiceDep
):
    return service.update(template_id, body)


@router.delete("/{template_id}", status_code=204)
def delete_note_template(
    template_id: int,
    service: NoteTemplateServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(template_id, delete_reason)
