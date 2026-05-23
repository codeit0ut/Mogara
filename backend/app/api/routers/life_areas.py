from fastapi import APIRouter

from app.api.deps import LifeAreaServiceDep
from app.schemas import LifeAreaCreate, LifeAreaOut, LifeAreaUpdate

router = APIRouter(prefix="/life-areas", tags=["life-areas"])


@router.get("", response_model=list[LifeAreaOut])
def list_life_areas(service: LifeAreaServiceDep):
    return service.list_all()


@router.get("/{area_id}", response_model=LifeAreaOut)
def get_life_area(area_id: int, service: LifeAreaServiceDep):
    return service.get(area_id)


@router.post("", response_model=LifeAreaOut, status_code=201)
def create_life_area(body: LifeAreaCreate, service: LifeAreaServiceDep):
    return service.create(body)


@router.patch("/{area_id}", response_model=LifeAreaOut)
def update_life_area(area_id: int, body: LifeAreaUpdate, service: LifeAreaServiceDep):
    return service.update(area_id, body)


@router.delete("/{area_id}", status_code=204)
def delete_life_area(area_id: int, service: LifeAreaServiceDep):
    service.delete(area_id)
