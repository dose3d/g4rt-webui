import hashlib
import os
import time
from datetime import timedelta
from wsgiref.util import FileWrapper

from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404


MODULE_ROOT = 'root'
MODULE_LOGS = 'logs'


@api_view(['GET', 'HEAD'])
@permission_classes([permissions.AllowAny])
def download_by_token(request, module, identify, ts, sha):
    if sha == make_hash(ts, module, identify):
        return download_response(module, identify, request.query_params.get('plain'))
    return HttpResponse('Link expired', status=410, content_type="text/plain")


def download_response(module, identify, plain):
    if module == MODULE_ROOT:
        return download_root_file(identify)
    elif module == MODULE_LOGS:
        return download_logs_file(identify, plain)


def download_root_file(identify):
    from tnd3d.models import JobRootFile

    jrf = get_object_or_404(JobRootFile, pk=identify)
    job = jrf.job
    fn = os.path.join(job.get_runners_job().get_job_path(), jrf.file_name)
    return download_file(fn, jrf.file_name, 'application/octet-stream')


def download_logs_file(identify, plain):
    from tnd3d.models import JobLogFile

    jrf = get_object_or_404(JobLogFile, pk=identify)
    job = jrf.job
    if jrf.is_output:
        fn = os.path.join(job.get_runners_job().get_job_path(), 'log.txt')
    else:
        fn = os.path.join(job.get_runners_job().get_job_path(), 'log', jrf.file_name)
    return download_file(fn, jrf.file_name, 'text/plain; charset=UTF-8', plain)


def download_file(file_path, file_name, content_type, plain, chunk_size=8192):
    file_stat = os.stat(file_path)
    response = StreamingHttpResponse(
        FileWrapper(
            open(file_path, "rb"),
            chunk_size,
        ),
        content_type=content_type,
    )
    response["Content-Length"] = file_stat.st_size
    if file_name is not None and not plain:
        response["Content-Disposition"] = f"attachment; filename={file_name}"
    return response


def make_hash(unix, module, identify):
    m = hashlib.sha256()
    m.update(bytes('%s_%s_%s_%s' % (str(unix), module, str(identify), settings.SECRET_KEY), 'utf-8'))
    return m.hexdigest()


def generate_download_href(module, identify, expiration=None):
    if expiration is None:
        expiration = settings.EXPIRATION_LINK
    date_time = (timezone.now() + timedelta(seconds=expiration))
    unix = int(time.mktime(date_time.timetuple()))
    return '/download/%s/%s/%d/%s/' % (module, str(identify), unix, make_hash(unix, module, identify))
