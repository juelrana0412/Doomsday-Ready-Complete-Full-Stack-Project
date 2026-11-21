from rest_framework.routers import DefaultRouter
from .views import CinemaViewSet

router = DefaultRouter()

router.register(
    'cinemas',
    CinemaViewSet,
    basename='cinema'
)

urlpatterns = router.urls