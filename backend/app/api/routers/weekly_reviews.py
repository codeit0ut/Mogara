from fastapi import APIRouter, Query

from app.api.deps import WeeklyReviewServiceDep
from app.schemas import WeeklyReviewCreate, WeeklyReviewOut, WeeklyReviewUpdate

router = APIRouter(prefix="/weekly-reviews", tags=["weekly-reviews"])


@router.get("", response_model=list[WeeklyReviewOut])
def list_weekly_reviews(
    service: WeeklyReviewServiceDep,
    include_deleted: bool = False,
):
    return service.list_all(include_deleted=include_deleted)


@router.get("/{review_id}", response_model=WeeklyReviewOut)
def get_weekly_review(review_id: int, service: WeeklyReviewServiceDep):
    return service.get(review_id)


@router.post("", response_model=WeeklyReviewOut, status_code=201)
def create_weekly_review(body: WeeklyReviewCreate, service: WeeklyReviewServiceDep):
    return service.create(body)


@router.patch("/{review_id}", response_model=WeeklyReviewOut)
def update_weekly_review(
    review_id: int, body: WeeklyReviewUpdate, service: WeeklyReviewServiceDep
):
    return service.update(review_id, body)


@router.delete("/{review_id}", status_code=204)
def delete_weekly_review(
    review_id: int,
    service: WeeklyReviewServiceDep,
    delete_reason: str | None = Query(None),
):
    service.delete(review_id, delete_reason)
