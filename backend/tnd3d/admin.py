from django.contrib import admin

from tnd3d.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'title', 'description', 'status', 'ret_code', 'updated_at')
    list_editable = ('title', 'description')
