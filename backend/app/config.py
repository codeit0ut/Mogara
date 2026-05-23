from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
DATABASE_PATH = DATA_DIR / "tracker.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
