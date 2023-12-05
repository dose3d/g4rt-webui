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
MODULE_UPLOADS = 'uploads'


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
    elif module == MODULE_UPLOADS:
        return download_upload_file(identify)


def download_root_file(identify):
    from tnd3d.models import JobRootFile

    jrf = get_object_or_404(JobRootFile, pk=identify)
    job = jrf.job
    fn = os.path.join(job.get_runners_job().get_job_path(), jrf.file_name)
    return download_file(fn, jrf.file_name, 'application/octet-stream', False)


def download_upload_file(identify):
    from tnd3d.models import RootFile

    jrf = get_object_or_404(RootFile, pk=identify)
    file = jrf.uploaded_file.file
    #fn = os.path.join(job.get_runners_job().get_job_path(), jrf.file_name)
    #return download_file(fn, jrf.file_name, 'application/octet-stream', False)
    return ""


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


def download_tail_of_text_file(file_path, file_name=None, max_size=8192):
    file_stat = os.stat(file_path)

    with open(file_path) as f:
        lines = []
        if file_stat.st_size > max_size:
            f.seek(file_stat.st_size - max_size)
            lines.append('!!! This is tail of output log file. Full log size: %d bytes, you see latest %d percent !!!\nIf you wand see whole log file please download in Log files section.\n\n\n' % (file_stat.st_size, max_size * 100 / file_stat.st_size))
        lines.extend(f.readlines())
        response = HttpResponse(
            ''.join(lines),
            content_type='text/plain; charset=UTF-8',
        )
        if file_name is not None:
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
