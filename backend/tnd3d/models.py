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
    ret_code = models.IntegerField(null=True, blank=True, verbose_name=_('Return code of Dose3D process'))
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

    def sync_status(self, force=False):
        old_status = self.status

        job = self.get_runners_job()

        if old_status != job.status:
            self.status = job.status
            self.ret_code = job.get_ret_code()
            self.save()
        if force or self.status == DONE:
            self.reload_files()

    def reload_files(self):
        self.reload_root_files()
        self.reload_log_files()

    def reload_root_files(self):
        job = self.get_runners_job()

        # get root files
        fns = job.get_root_files()

        # delete deleted files from database
        JobRootFile.objects.filter(job=self).exclude(file_name__in=fns).delete()

        # create or update record for existing files
        for fn in fns:
            rf = os.path.join(job.get_job_path(), fn)
            file_stats = os.stat(rf)
            jrf, created = JobRootFile.objects.get_or_create(
                job=self,
                file_name=fn
            )

            # update size only when changed or created (prevent to unnecessary SQL UPDATE)
            if created or jrf.size != file_stats.st_size:
                jrf.size = file_stats.st_size
                jrf.save()

    def reload_log_files(self):
        job = self.get_runners_job()
        # get logs files
        fns = job.get_log_files()

        # delete deleted files from database
        JobLogFile.objects.filter(job=self).exclude(file_name__in=fns).delete()

        # create or update record for existing files
        for fn in fns:
            rf = os.path.join(job.get_job_path(), 'log', fn)
            file_stats = os.stat(rf)
            jrf, created = JobLogFile.objects.get_or_create(
                job=self,
                file_name=fn
            )

            # update size only when changed or created (prevent to unnecessary SQL UPDATE)
            if created or jrf.size != file_stats.st_size:
                jrf.size = file_stats.st_size
                jrf.save()

        # log file with process output
        jrf, created = JobLogFile.objects.get_or_create(
            job=self,
            file_name='log.txt',
            is_output=True
        )
        file_stats = os.stat(job.get_log_file())
        if created or jrf.size != file_stats.st_size:
            jrf.size = file_stats.st_size
            jrf.save()

    @staticmethod
    def sync_not_done_jobs():
        for j in Job.objects.exclude(status=DONE):
            j.sync_status()


class JobRootFile(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255, verbose_name=_("File from ROOT"))
    size = models.IntegerField(verbose_name=_("File size"), default=0)

    class Meta:
        ordering = ('file_name',)
        verbose_name = _('Root file')
        verbose_name_plural = _('Root files')
        unique_together = (('job', 'file_name'),)


class JobLogFile(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255, verbose_name=_("Logs file from ROOT"))
    size = models.IntegerField(verbose_name=_("File size"), default=0)
    is_output = models.BooleanField(default=False, verbose_name=_("This is logs from output of dose3d process"))

    class Meta:
        ordering = ('file_name',)
        verbose_name = _('Logs file')
        verbose_name_plural = _('Logs files')
        unique_together = (('job', 'file_name'),)
