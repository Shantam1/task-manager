from django.db import models
from django.contrib.auth.models import AbstractUser


class Organization(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class User(AbstractUser):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True
    )


class Project(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "Todo"),
        ("in_progress", "In Progress"),
        ("done", "Done"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assignee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assigned_tasks")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")

    created_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)