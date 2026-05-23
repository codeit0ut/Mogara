from datetime import date

from fastapi import APIRouter, Query

from app.api.deps import CoreTaskServiceDep
from app.schemas import CoreTaskCreate, CoreTaskOut, CoreTaskUpdate

router = APIRouter(prefix="/core-tasks", tags=["core-tasks"])


@router.get("", response_model=list[CoreTaskOut])
def list_core_tasks(
    service: CoreTaskServiceDep,
    task_date: date | None = Query(None),
    include_deleted: bool = False,
):
    return service.list_all(task_date=task_date, include_deleted=include_deleted)


@router.get("/{task_id}", response_model=CoreTaskOut)
def get_core_task(task_id: int, service: CoreTaskServiceDep):
    return service.get(task_id)


@router.post("", response_model=CoreTaskOut, status_code=201)
def create_core_task(body: CoreTaskCreate, service: CoreTaskServiceDep):
    return service.create(body)


@router.patch("/{task_id}", response_model=CoreTaskOut)
def update_core_task(
    task_id: int, body: CoreTaskUpdate, service: CoreTaskServiceDep
):
    return service.update(task_id, body)


@router.delete("/{task_id}", status_code=204)
def delete_core_task(
    task_id: int,
    service: CoreTaskServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(task_id, delete_reason)
