import re

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.time import utc_now
from app.models import LifeArea, LifeGoal
from app.schemas import LifeAreaCreate, LifeAreaUpdate
from app.services.base import apply_update


def _slugify_label(label: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", label.lower().strip())
    slug = slug.strip("-")
    return (slug or "area")[:64]


def _unique_name(
    db: Session, user_id: int, base_name: str, exclude_id: int | None = None
) -> str:
    name = base_name
    suffix = 2
    while True:
        q = db.query(LifeArea).filter(
            LifeArea.user_id == user_id, LifeArea.name == name
        )
        if exclude_id is not None:
            q = q.filter(LifeArea.id != exclude_id)
        if not q.first():
            return name
        name = f"{base_name}-{suffix}"[:64]
        suffix += 1


class LifeAreaService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def list_all(self) -> list[LifeArea]:
        return (
            self.db.query(LifeArea)
            .filter(LifeArea.user_id == self.user_id)
            .order_by(LifeArea.label)
            .all()
        )

    def get(self, area_id: int) -> LifeArea:
        area = (
            self.db.query(LifeArea)
            .filter(LifeArea.id == area_id, LifeArea.user_id == self.user_id)
            .first()
        )
        if not area:
            raise NotFoundError("Life area not found")
        return area

    def create(self, data: LifeAreaCreate) -> LifeArea:
        label = data.label.strip()
        if not label:
            raise ValidationError("label cannot be empty")

        dup_label = (
            self.db.query(LifeArea)
            .filter(LifeArea.user_id == self.user_id, LifeArea.label == label)
            .first()
        )
        if dup_label:
            raise ConflictError(f"Life area '{label}' already exists")

        now = utc_now()
        name = _unique_name(self.db, self.user_id, _slugify_label(label))
        area = LifeArea(
            user_id=self.user_id,
            name=name,
            label=label,
            created_at=now,
            updated_at=now,
        )
        self.db.add(area)
        self.db.commit()
        self.db.refresh(area)
        return area

    def update(self, area_id: int, data: LifeAreaUpdate) -> LifeArea:
        area = self.get(area_id)
        payload = data.model_dump(exclude_unset=True)
        if "label" in payload:
            label = payload["label"].strip() if payload["label"] else ""
            if not label:
                raise ValidationError("label cannot be empty")
            dup = (
                self.db.query(LifeArea)
                .filter(
                    LifeArea.user_id == self.user_id,
                    LifeArea.label == label,
                    LifeArea.id != area_id,
                )
                .first()
            )
            if dup:
                raise ConflictError(f"Life area '{label}' already exists")
            payload["label"] = label
        apply_update(area, payload)
        self.db.commit()
        self.db.refresh(area)
        return area

    def delete(self, area_id: int) -> None:
        area = self.get(area_id)
        linked = (
            self.db.query(LifeGoal)
            .filter(
                LifeGoal.user_id == self.user_id,
                LifeGoal.life_area_id == area_id,
                LifeGoal.is_deleted.is_(False),
            )
            .first()
        )
        if linked:
            raise ConflictError(
                "Cannot delete life area while life goals are linked to it"
            )
        self.db.delete(area)
        self.db.commit()
