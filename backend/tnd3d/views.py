import os.path

from dose3d import QUEUE, RUNNING
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from commons.views import CustomPageNumberPagination, VariousSerializersViewSet
from tnd3d.download import download_file
from tnd3d.models import Job, JobRootFile
from tnd3d.serializer import JobSerializer, JobSerializerPending, JobRootFileSerializer, \
    JobListSerializer, JobRootFileDetailSerializer
from django.utils.translation import gettext_lazy as _


class JobViewSet(VariousSerializersViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    list_serializer_class = JobListSerializer
    pagination_class = CustomPageNumberPagination

    def get_serializer_class(self):
        if self.action == 'update':
            obj = self.get_object()
            if obj is not None and obj.status != QUEUE:
                # if job is pending then args and toml is read only
                return JobSerializerPending
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        Job.sync_not_done_jobs()
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.sync_status(True)
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        job = serializer.save()
        job.flush_job_to_queue()

    def perform_destroy(self, instance):
        if instance.status == RUNNING:
            raise ValidationError(_('Running jobs can not be deleted'))
        instance.get_runners_job().purge()
        super().perform_destroy(instance)

    @action(detail=True, methods=['put'])
    def kill(self, request, pk=None):
        obj = self.get_object()
        if obj.status != RUNNING:
            raise ValidationError(_('Job must be in RUNNING state'))
        obj.get_runners_job().kill()
        return self.retrieve(request)

    @action(detail=True, methods=['get'])
    def logs(self, request):
        """Download logs file API, not used by Frontend"""
        obj = self.get_object()
        job = obj.get_runners_job()
        fn = job.get_log_file()
        return download_file(fn, None, 'text/plain; charset=UTF-8')

    @action(detail=True, methods=['get'])
    def output(self, request, pk=None):
        """Download output logs file API"""
        obj = self.get_object()
        job = obj.get_runners_job()
        fn = job.get_log_file()
        return download_file(fn, None, 'text/plain; charset=UTF-8')


class JobRootFileViewSet(viewsets.ReadOnlyModelViewSet):
    # FIXME: not used?
    """Download ROOT file API, not used by Frontend"""
    queryset = JobRootFile.objects.all()
    serializer_class = JobRootFileSerializer

    def filter_queryset(self, queryset):
        if self.action == 'list':
            # filter by &job=job_id only in GET, TODO: use django filter library
            job = self.request.query_params.get('job')
            if not job:
                raise ValidationError('job filter required')
            return super().filter_queryset(queryset.filter(job_id=job))
        else:
            return super().filter_queryset(queryset)

    def retrieve(self, request, *args, **kwargs):
        f = self.get_object()
        job = f.job.get_runner_job()
        fn = os.path.join(job.get_job_path(), f.file_name)
        return download_file(fn, f.file_name, 'application/octet-stream')


class JobRootFileDetailViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobRootFile.objects.all()
    serializer_class = JobRootFileDetailSerializer

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        f = self.get_object()
        job = f.job.get_runners_job()
        fn = os.path.join(job.get_job_path(), f.file_name)
        return download_file(fn, f.file_name, 'application/octet-stream')

    @action(detail=True, methods=['post'])
    def render(self, request, pk=None):
        f = self.get_object()
        job = f.job.get_runners_job()
        fn = os.path.join(job.get_job_path(), f.file_name)

        json_output_file = os.path.join(job.get_job_path(), f.file_name.replace('.root', '_visualize.json'))
        root_output_file = os.path.join(job.get_job_path(), f.file_name.replace('.root', '_visualize.root'))

        try:
            from pydose3d.svc.dose3d import Dose3DSvc
            from pydose3d.svc.ntuple_data import NTupleDataSvc

            NTupleDataSvc.ImplicitMT = True
            d3dsvc = Dose3DSvc()
            d3dsvc.set_data(fn, "Dose3DVoxelisedTTree")

            d3dsvc.write_dose_z_profile_to_json(json_output_file, MLayer=0, MColumn=0, CLayer=2, CColumn=2, normalized=True)
            d3dsvc.write_module_dose_map(root_output_file, MLayer=0, CLayer=2)
        except:
            pass

        f.job.sync_status(force=True)

        return Response({})
