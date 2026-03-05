from rest_framework import serializers
from .models import Organization, User, Project, Task, Comment


from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username"]

class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["owner", "organization", "created_at"]


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["created_by"]


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ["user", "created_at"]