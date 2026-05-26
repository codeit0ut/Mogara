from typing import Annotated, Callable, TypeVar

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.core.security import decode_access_token
from app.database import get_db
from app.models import User
from app.services import (
    AuthService,
    CoreTaskService,
    LifeAreaService,
    LifeGoalService,
    MomentumService,
    NoteTemplateService,
    QuickNoteService,
    SettingsService,
    ShortTermGoalService,
    WeeklyGoalService,
    WeeklyReviewService,
)
from app.services.analytics import AnalyticsService

T = TypeVar("T")

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError("Sign in to continue")
    user_id, _username = decode_access_token(credentials.credentials)
    return AuthService(db).get_user(user_id)


def _service_factory(service_cls: type[T]) -> Callable[..., T]:
    def factory(
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ) -> T:
        return service_cls(db, user.id)

    return factory


AuthServiceDep = Annotated[AuthService, Depends(lambda db=Depends(get_db): AuthService(db))]
LifeAreaServiceDep = Annotated[LifeAreaService, Depends(_service_factory(LifeAreaService))]
LifeGoalServiceDep = Annotated[LifeGoalService, Depends(_service_factory(LifeGoalService))]
ShortTermGoalServiceDep = Annotated[
    ShortTermGoalService, Depends(_service_factory(ShortTermGoalService))
]
WeeklyGoalServiceDep = Annotated[
    WeeklyGoalService, Depends(_service_factory(WeeklyGoalService))
]
CoreTaskServiceDep = Annotated[CoreTaskService, Depends(_service_factory(CoreTaskService))]
NoteTemplateServiceDep = Annotated[
    NoteTemplateService, Depends(_service_factory(NoteTemplateService))
]
QuickNoteServiceDep = Annotated[QuickNoteService, Depends(_service_factory(QuickNoteService))]
MomentumServiceDep = Annotated[MomentumService, Depends(_service_factory(MomentumService))]
WeeklyReviewServiceDep = Annotated[
    WeeklyReviewService, Depends(_service_factory(WeeklyReviewService))
]
SettingsServiceDep = Annotated[SettingsService, Depends(_service_factory(SettingsService))]
AnalyticsServiceDep = Annotated[AnalyticsService, Depends(_service_factory(AnalyticsService))]

CurrentUserDep = Annotated[User, Depends(get_current_user)]
