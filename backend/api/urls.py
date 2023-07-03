from django.urls import path
from rest_framework import routers

from tnd3d.views import JobViewSet, JobRootFileDetailViewSet, WorkspaceViewSet, WorkspaceCellViewSet
from . import views

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'jrf', JobRootFileDetailViewSet)
router.register(r'ws', WorkspaceViewSet)
router.register(r'wsc', WorkspaceCellViewSet)

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('config/', views.get_config),
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
] + router.urls
