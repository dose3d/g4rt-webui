import os

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from dose3d import JobsManager, QUEUE, RUNNING, DONE, Dose3DException


INIT = 'init'


class Job(models.Model):
    STATUS = [
        ('INIT', INIT),
        ('QUEUE', QUEUE),
        ('RUNNING', RUNNING),
        ('DONE', DONE),
    ]

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Creation date'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Last updated'))
    title = models.CharField(max_length=64, verbose_name=_('Jobs title'))
    description = models.TextField(blank=True, default='', verbose_name=_('Jobs description'))
    status = models.CharField(max_length=16, choices=STATUS, default=INIT, verbose_name=_('Current status'))
    ret_code = models.BooleanField(null=True, blank=True, verbose_name=_('Return code of Dose3D process'))
    toml = models.TextField(blank=True, default='', verbose_name=_('Content of TOML file'))
    args = models.CharField(max_length=255, default='', verbose_name=_('Dose3D command line args'))

    class Meta:
        ordering = ('created_at',)
        verbose_name = _('Job')
        verbose_name_plural = _('Jobs')

    def get_runners_job(self, update_state=True):
        jm = JobsManager(settings.CONFIG_FILE)
        return jm.get_job(str(self.id), update_state)

    def flush_job_to_queue(self):
        job = self.get_runners_job(False)
        if self.status == INIT:
            job.flush_to_queue(self.args, self.toml)
            self.status = QUEUE
            self.save()
        else:
            raise Dose3DException('Job must be in INIT state, not in %s' % self.status)

    def sync_status(self):
        old_status = self.status

        job = self.get_runners_job()

        if old_status != job.status:
            self.status = job.status
            self.ret_code = job.get_ret_code()
            self.save()
            if self.status == DONE:
                rfs = job.get_root_files()
                for rf in rfs:
                    fn = os.path.basename(rf)
                    if JobRootFile.objects.filter(job=self, file_name=rf).count() == 0:
                        file_stats = os.stat(fn)
                        size = file_stats.st_size
                        JobRootFile.objects.create(job=self, file_name=rf, size=size)

    @staticmethod
    def sync_not_done_jobs():
        for j in Job.objects.exclude(status=DONE):
            j.sync_status()


class JobRootFile(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255, verbose_name=_("File from ROOT"))
    size = models.IntegerField(verbose_name=_("File size"))

    class Meta:
        ordering = ('file_name',)
        verbose_name = _('Root file')
        verbose_name_plural = _('Root files')
        unique_together = (('job', 'file_name'),)
