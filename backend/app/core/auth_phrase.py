import re

from app.core.exceptions import ValidationError

MOTIVATING_PHRASE_SUGGESTIONS: tuple[str, ...] = (
    "Keep Going",
    "One More Step",
    "Stay Strong",
    "Keep Moving",
    "keeping promises",
)

_WEAK_PHRASES = frozenset(
    p.lower()
    for p in (
        "password",
        "12345678",
        "letmein",
        "qwerty",
        "admin",
    )
)


def validate_motivating_phrase(phrase: str) -> str:
    text = phrase.strip()
    if len(text) < 8:
        raise ValidationError(
            "Your phrase should be at least 8 characters — something short you’ll remember."
        )
    words = [w for w in re.split(r"\s+", text) if w]
    if len(words) < 2:
        raise ValidationError(
            "Use at least two words — a quick line that steadies you, not a single word or code."
        )
    if text.lower() in _WEAK_PHRASES:
        raise ValidationError("Choose a phrase that feels personal, not a common password.")
    if re.fullmatch(r"[\d\W_]+", text):
        raise ValidationError("Use words you can speak aloud — a line that steadies you.")
    return text


def validate_username(username: str) -> str:
    name = username.strip().lower()
    if len(name) < 3 or len(name) > 32:
        raise ValidationError("Username must be 3–32 characters.")
    if not re.fullmatch(r"[a-z0-9_]+", name):
        raise ValidationError("Username may use letters, numbers, and underscores only.")
    return name
