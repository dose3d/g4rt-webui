from django.contrib import admin

from tnd3d.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'title', 'description', 'status', 'is_error', 'updated_at')
    list_editable = ('title', 'description')
