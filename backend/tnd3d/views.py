import os.path
from wsgiref.util import FileWrapper

from django.http import StreamingHttpResponse
from dose3d import QUEUE, RUNNING
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from commons.views import CustomPageNumberPagination
from tnd3d.models import Job, JobRootFile
from tnd3d.serializer import JobSerializer, JobSerializerPending, JobRootFileSerializer
from django.utils.translation import gettext_lazy as _


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    pagination_class = CustomPageNumberPagination

    def get_serializer_class(self):
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
        obj.sync_status()
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        job = serializer.save()
        job.flush_job_to_queue()

    def perform_destroy(self, instance):
        if instance.status == RUNNING:
            raise ValidationError(_('Running jobs can not be deleted'))
        instance.get_runner_job().purge()
        super().perform_destroy(instance)

    @action(detail=True, methods=['put'])
    def kill(self, request, pk=None):
        obj = self.get_object()
        if obj.status != RUNNING:
            raise ValidationError(_('Job must be in RUNNING state'))
        obj.get_runner_job().kill()
        return Response({})

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        obj = self.get_object()
        job = obj.get_runner_job()
        fn = job.get_log_file()

        file_stat = os.stat(fn)

        chunk_size = 8192
        response = StreamingHttpResponse(
            FileWrapper(
                open(fn, "rb"),
                chunk_size,
            ),
            content_type='text/plain; charset=UTF-8',
        )
        response["Content-Length"] = file_stat.st_size
        return response


class JobRootFileViewSet(viewsets.ReadOnlyModelViewSet):
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
        file_stat = os.stat(fn)

        chunk_size = 8192
        response = StreamingHttpResponse(
            FileWrapper(
                open(fn, "rb"),
                chunk_size,
            ),
            content_type='application/octet-stream',
        )
        response["Content-Length"] = file_stat.st_size
        response["Content-Disposition"] = f"attachment; filename={f.file_name}"
        return response
