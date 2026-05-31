"""Week boundaries aligned with date-fns (0=Sunday .. 6=Saturday)."""

from datetime import date, timedelta


def week_start_date(d: date, week_starts_on: int) -> date:
    """Start of the week containing ``d`` (same rules as frontend weekBounds)."""
    dow = (d.weekday() + 1) % 7
    offset = (dow - week_starts_on) % 7
    return d - timedelta(days=offset)


def week_end_date(week_start: date) -> date:
    return week_start + timedelta(days=6)
