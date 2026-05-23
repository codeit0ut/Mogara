"""Strict goal chain: life area → life goal → short-term → weekly focus → core task."""

from sqlalchemy.orm import Session

from app.models import CoreTask, LifeArea, LifeGoal, ShortTermGoal, WeeklyGoal


def chain_from_weekly(db: Session, weekly_goal_id: int | None) -> dict:
    """Resolve ids walking up from weekly focus."""
    out = {
        "weekly_goal_id": weekly_goal_id,
        "short_term_goal_id": None,
        "life_goal_id": None,
        "life_area_id": None,
        "life_area_label": None,
    }
    if not weekly_goal_id:
        return out
    wg = db.get(WeeklyGoal, weekly_goal_id)
    if not wg or wg.is_deleted:
        return out
    out["short_term_goal_id"] = wg.short_term_goal_id
    st = db.get(ShortTermGoal, wg.short_term_goal_id)
    if not st or st.is_deleted:
        return out
    out["life_goal_id"] = st.life_goal_id
    lg = db.get(LifeGoal, st.life_goal_id)
    if not lg or lg.is_deleted:
        return out
    out["life_area_id"] = lg.life_area_id
    if lg.life_area_id:
        area = db.get(LifeArea, lg.life_area_id)
        if area:
            out["life_area_label"] = area.label
    return out


def chain_from_task(db: Session, task: CoreTask) -> dict:
    return chain_from_weekly(db, task.weekly_goal_id)
