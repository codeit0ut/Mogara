import base64
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import DATA_DIR
from app.core.exceptions import UnauthorizedError

_SECRET_FILE = DATA_DIR / ".jwt_secret"


def _load_secret_key() -> str:
    """Stable signing key across server restarts (unless env overrides)."""
    env_key = os.environ.get("MOGARA_SECRET_KEY")
    if env_key:
        return env_key
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if _SECRET_FILE.is_file():
        return _SECRET_FILE.read_text(encoding="utf-8").strip()
    key = secrets.token_hex(32)
    _SECRET_FILE.write_text(key, encoding="utf-8")
    try:
        _SECRET_FILE.chmod(0o600)
    except OSError:
        pass
    return key


SECRET_KEY = _load_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return base64.b64encode(salt + dk).decode("ascii")


def verify_password(password: str, stored: str) -> bool:
    try:
        raw = base64.b64decode(stored.encode("ascii"))
    except (ValueError, TypeError):
        return False
    if len(raw) < 17:
        return False
    salt, dk = raw[:16], raw[16:]
    check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return secrets.compare_digest(dk, check)


def create_access_token(user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> tuple[int, str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", ""))
        username = str(payload.get("username", ""))
    except (JWTError, ValueError, TypeError) as exc:
        raise UnauthorizedError("Invalid or expired session") from exc
    if not username:
        raise UnauthorizedError("Invalid session")
    return user_id, username
