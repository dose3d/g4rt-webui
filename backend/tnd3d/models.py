import os
import json

from django.conf import settings
from django.db import models
from django.db.models import Max
from django.utils.translation import gettext_lazy as _
from dose3d import JobsManager, INIT, QUEUE, RUNNING, DONE, Dose3DException

MARKDOWN = 'markdown'
ROOT = 'root'
DOSE3D = 'dose3d'

WC_POS_STEP = 2


def get_max_or_one(qs, field):
    v = qs.aggregate(v=Max(field))['v']
    return v + WC_POS_STEP if v else WC_POS_STEP


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

    def init_job(self):
        job = self.get_runners_job(False)

        if self.status == INIT:
            job.flush_to_queue(self.args, self.toml, False)
        else:
            raise Dose3DException('Job must be in INIT state, not in %s' % self.status)

    def flush_job_to_queue(self):
        job = self.get_runners_job()

        if self.status == INIT:
            job.flush_to_queue(self.args, self.toml, True)
            self.status = QUEUE
            self.save()
        else:
            raise Dose3DException('Job must be in INIT state, not in %s' % self.status)

    def remove_from_queue(self):
        job = self.get_runners_job()
        if self.status == QUEUE:
            job.dequeue()
            self.status = INIT
            self.save()
        else:
            raise Dose3DException('Job must be in QUEUE state, not in %s' % self.status)

    def sync_status(self, force=False):
        old_status = self.status

        job = self.get_runners_job()

        if old_status != job.status:
            self.status = job.status
            self.ret_code = job.get_ret_code()
            self.save()
        if force or self.status == DONE:
            if self.status != INIT and self.status != QUEUE:
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


class Workspace(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Creation date'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Last updated'))
    title = models.CharField(max_length=64, verbose_name=_('Jobs title'))
    description = models.TextField(blank=True, default='', verbose_name=_('Jobs description'))

    def update_pos(self):
        pos = WC_POS_STEP
        for o in self.workspacecell_set.all():
            o.pos = pos
            o.save(update_fields=['pos'])
            pos += WC_POS_STEP

    @property
    def jobs(self):
        jobs = []
        for j in self.workspacejob_set.all():
            jobs.append(j.job_id)
        return jobs

    @property
    def jobs_files_absolute(self):
        files = []
        for j in self.workspacejob_set.all():
            job = j.job.get_runners_job()
            for r in j.job.jobrootfile_set.all():
                fn = os.path.join(job.get_job_path(), r.file_name)
                files.append(fn)
        return files

    class Meta:
        ordering = ('created_at',)
        verbose_name = _('Workspace')
        verbose_name_plural = _('Workspaces')


class WorkspaceJob(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, verbose_name=_('Workspace'))
    job = models.ForeignKey(Job, on_delete=models.CASCADE, verbose_name=_('Job'))

    class Meta:
        unique_together = (('workspace', 'job'),)
        ordering = ('job',)
        verbose_name = _('Job to workspace assign')
        verbose_name_plural = _('Job to workspace assigns')


class WorkspaceCell(models.Model):
    TYPE = [
        ('m', MARKDOWN),
        ('r', ROOT),
        ('d', DOSE3D),
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, verbose_name=_('Workspace'))
    pos = models.IntegerField(verbose_name=_('Position in workspace'))
    type = models.CharField(max_length=1, choices=TYPE)
    content = models.TextField(blank=True, default='', verbose_name=_('Cell content'))

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if not self.pos:
            qs = WorkspaceCell.objects.filter(workspace=self.workspace)
            self.pos = get_max_or_one(qs, 'pos')
        super().save(force_insert, force_update, using, update_fields)

    def get_store_file_name(self):
        jm = JobsManager(settings.CONFIG_FILE)
        return os.path.join(jm.CACHE_DIR, 'ws_cell_%d' % self.id)

    def get_dose3d_cache_file_path(self, m_layer, c_layer):
        return "%s_m%d_c%d" % (self.get_store_file_name(), m_layer, c_layer)

    def render_dose3d_if_need(self, CLayer=None, MLayer=None, force=False):
        """
        Render Dose3D cell files to cache dir if not exists (or force=True)
        """

        if self.type != 'd':
            raise Exception(_('The cell must be Dose3D cell type'))

        params = json.loads(self.content)
        m_layer = int(params.get('MLayer', '0') if MLayer is None else MLayer)
        c_layer = int(params.get('CLayer', '0') if CLayer is None else CLayer)

        fn = self.get_dose3d_cache_file_path(m_layer, c_layer)
        fn_store = self.get_store_file_name()
        fn_root = "%s.root" % fn
        fn_json_info = "%s_info.json" % fn_store
        fn_json_plots = "%s_plots.json" % fn_store

        if not force and (
                not os.path.isfile(fn_root) or
                not os.path.isfile(fn_json_info) or
                not os.path.isfile(fn_json_plots)
        ):
            ntuple_data = self.workspace.jobs_files_absolute

            if settings.DEBUG:
                print(json.dumps({
                    'MLayer': m_layer,
                    'CLayer': c_layer,
                    'ntuple_data': ntuple_data,
                    'fn_root': fn_root,
                    'fn_json_info': fn_json_info,
                    'fn_json_plots': fn_json_plots
                }, indent=4))

            import pydose3d
            from pydose3d.svc.dose3d import Dose3DSvc
            pydose3d.set_log_level("INFO")

            svc = Dose3DSvc()
            svc.set_data(files=ntuple_data)

            info = svc.get_mcrun_info()
            with open(fn_json_info, 'w') as file:
                file.write(json.dumps(info, indent=4))

            # List of 2D plots
            plots2d = svc.get_list_of_2dmaps()
            with open(fn_json_plots, 'w') as file:
                file.write(json.dumps(plots2d, indent=4))

            # Write hists from all loaded files to output file
            svc.write_module_dose_map(file=fn_root, MLayer=m_layer, CLayer=c_layer)

        return {'fn_root': fn_root, 'fn_json_info': fn_json_info, 'fn_json_plots': fn_json_plots}

    class Meta:
        ordering = ('pos',)
        verbose_name = _('Workspace cell')
        verbose_name_plural = _('Workspace cells')
