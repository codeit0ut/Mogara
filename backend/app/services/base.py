from app.core.time import utc_now


def apply_update(instance: object, data: dict) -> None:
    for key, value in data.items():
        setattr(instance, key, value)
    if hasattr(instance, "updated_at"):
        instance.updated_at = utc_now()


def soft_delete(instance: object, delete_reason: str | None = None) -> None:
    instance.is_deleted = True
    instance.deleted_at = utc_now()
    instance.delete_reason = delete_reason
    if hasattr(instance, "updated_at"):
        instance.updated_at = utc_now()
