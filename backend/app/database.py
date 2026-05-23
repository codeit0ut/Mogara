from collections.abc import Generator
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import DATA_DIR, DATABASE_URL

_ALEMBIC_INI = Path(__file__).resolve().parents[1] / "alembic.ini"


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def run_migrations() -> None:
    """Apply Alembic migrations up to head."""
    import app.models  # noqa: F401

    cfg = Config(str(_ALEMBIC_INI))
    tables = set(inspect(engine).get_table_names())
    has_app_tables = "users" in tables
    has_alembic = "alembic_version" in tables

    if has_app_tables and not has_alembic:
        command.stamp(cfg, "head")

    command.upgrade(cfg, "head")


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    run_migrations()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Delete order: children before parents; users/settings last.
_ALL_DATA_TABLES = (
    "momentum_events",
    "core_tasks",
    "quick_notes",
    "weekly_goals",
    "weekly_reviews",
    "short_term_goals",
    "life_goals",
    "life_areas",
    "app_settings",
    "users",
)


def clear_all_data() -> None:
    """Remove every data row. Schema and migrations are unchanged."""
    import app.models  # noqa: F401

    with engine.begin() as conn:
        conn.exec_driver_sql("PRAGMA foreign_keys=OFF")
        for table in _ALL_DATA_TABLES:
            conn.exec_driver_sql(f"DELETE FROM {table}")
        conn.exec_driver_sql("PRAGMA foreign_keys=ON")


def clear_user_data() -> None:
    """Remove goal/task/review/momentum rows only (legacy helper)."""
    import app.models  # noqa: F401

    with engine.begin() as conn:
        conn.exec_driver_sql("PRAGMA foreign_keys=OFF")
        for table in _ALL_DATA_TABLES:
            if table in ("app_settings", "users"):
                continue
            conn.exec_driver_sql(f"DELETE FROM {table}")
        conn.exec_driver_sql("PRAGMA foreign_keys=ON")


if __name__ == "__main__":
    import sys

    if "--clear" in sys.argv:
        init_db()
        clear_all_data()
        print(f"Cleared all data in {DATABASE_URL}")
    else:
        init_db()
        print(f"Database ready at {DATABASE_URL}")
