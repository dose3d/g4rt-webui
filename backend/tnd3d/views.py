from rest_framework import viewsets

from commons.views import CustomPageNumberPagination
from tnd3d.models import Job
from tnd3d.serializer import JobSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    pagination_class = CustomPageNumberPagination
