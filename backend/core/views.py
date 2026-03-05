from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

from .models import Project, Task, Comment
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    UserSerializer,
)


User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()

    def get_queryset(self):
        # Limit visible users to the current user's organization
        return User.objects.filter(organization=self.request.user.organization)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see projects in their organization
        return Project.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        # Force project ownership and organization from the authenticated user
        serializer.save(
            owner=self.request.user,
            organization=self.request.user.organization,
        )


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Tasks are always scoped to the user's organization via the project
        return Task.objects.filter(
            project__organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        assignee = serializer.validated_data.get("assignee")
        project = serializer.validated_data.get("project")

        user_org = self.request.user.organization

        # Ensure project belongs to the same organization
        if project.organization != user_org:
            raise PermissionDenied("Project does not belong to your organization")

        # Ensure assignee belongs to the same organization
        if assignee.organization != user_org:
            raise PermissionDenied("Cannot assign task outside your organization")

        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        task = self.get_object()
        user = self.request.user

        # Enforce org isolation defensively (should already be ensured by queryset)
        if task.project.organization != user.organization:
            raise PermissionDenied("You cannot modify tasks outside your organization")

        # If status is being changed to "done", enforce assignee / owner rule
        new_status = serializer.validated_data.get("status", task.status)
        if (
            task.status != "done"
            and new_status == "done"
            and task.assignee != user
            and task.project.owner != user
        ):
            raise PermissionDenied(
                "Only the assignee or project owner can mark a task as done"
            )

        # If assignee or project are being changed, keep them inside the organization
        new_assignee = serializer.validated_data.get("assignee", task.assignee)
        new_project = serializer.validated_data.get("project", task.project)

        if new_assignee.organization != user.organization:
            raise PermissionDenied("Assignee must belong to your organization")

        if new_project.organization != user.organization:
            raise PermissionDenied("Project must belong to your organization")

        serializer.save()


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only comments on tasks in the current user's organization are visible
        return Comment.objects.filter(
            task__project__organization=self.request.user.organization
        )

    def perform_create(self, serializer):
        # User is always taken from the authenticated request
        serializer.save(user=self.request.user)