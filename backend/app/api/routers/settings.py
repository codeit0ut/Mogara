from fastapi import APIRouter

from app.api.deps import SettingsServiceDep
from app.schemas import AppSettingsOut, AppSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=AppSettingsOut)
def get_settings(service: SettingsServiceDep):
    return service.get_or_create()


@router.patch("", response_model=AppSettingsOut)
def update_settings(body: AppSettingsUpdate, service: SettingsServiceDep):
    return service.update(body)
