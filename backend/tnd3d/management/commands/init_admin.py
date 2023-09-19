from django.core.management import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Initialize default admin account"

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            User.objects.create_superuser('admin', 'admin@admin.com', 'admin')
            print('The "admin" user created with default "admin" password')
        except IntegrityError:
            print('The "admin" user already exists')
