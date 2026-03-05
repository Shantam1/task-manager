from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from core.views import ProjectViewSet, TaskViewSet, CommentViewSet, UserViewSet


router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"tasks", TaskViewSet, basename="tasks")
router.register(r"comments", CommentViewSet, basename="comments")
router.register(r"users", UserViewSet, basename="users")


schema_view = get_schema_view(
    openapi.Info(
        title="Task Manager API",
        default_version="v1",
        description="API documentation for the multi-organization task manager.",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT authentication endpoints
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Core API routes
    path("api/", include(router.urls)),

    # API documentation (Swagger / ReDoc)
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]