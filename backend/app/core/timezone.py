from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from app.core.time import utc_now


def get_zone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except Exception:
        return ZoneInfo("UTC")


def to_local_date(dt: datetime, timezone_name: str) -> date:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(get_zone(timezone_name)).date()


def local_today(timezone_name: str) -> date:
    return utc_now().astimezone(get_zone(timezone_name)).date()


def local_yesterday(timezone_name: str) -> date:
    return local_today(timezone_name) - timedelta(days=1)
