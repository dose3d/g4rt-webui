from datetime import timedelta, datetime
from django.db import models
from contrib.wl_test.utils import OverwriteStorage

class WLUploadedFile(models.Model):
    file = models.FileField(upload_to='wl-test/uploads', storage=OverwriteStorage())
    uploaded_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def remove_orphans():
        one_day_ago = datetime.now() - timedelta(days=1)
        deleted = []
        for orphan in WLUploadedFile.objects.filter(uploaded_at__lt=one_day_ago, rootfile__isnull=True):
            orphan.file.delete(save=False)
            deleted.append(orphan.id)
        WLUploadedFile.objects.filter(id__in=deleted).delete()
