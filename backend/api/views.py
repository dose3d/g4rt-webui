from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

from dose3d import JobsManager

from tnd3d.models import WorkspaceCell


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET'])
def get_config(request):
    jm = JobsManager(settings.CONFIG_FILE)
    config = jm.config
    return Response(config)


@api_view(['GET'])
@permission_classes([AllowAny])
def show_cell_debug(request):
    cell = request.query_params.get('cell')
    wc = WorkspaceCell.objects.get(pk=cell)
    render = wc.render_debug_of_dose3d()
    return HttpResponse(render, content_type='text/plain')
