from django.contrib import admin
from .models import Organization, User, Project, Task, Comment

admin.site.register(Organization)
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(Comment)