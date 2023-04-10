"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

from tnd3d.download import download_by_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include("api.urls")),
    path('download/<module>/<identify>/<int:ts>/<sha>/', download_by_token, name="download"),
    path(r'', serve, kwargs={'path': 'index.html', 'document_root': 'templates'}),
    path(r'asset-manifest.json', serve, kwargs={'path': 'asset-manifest.json', 'document_root': 'templates'}),
    path(r'favicon.ico', serve, kwargs={'path': 'favicon.ico', 'document_root': 'templates'}),
    path(r'logo192.png', serve, kwargs={'path': 'logo192.png', 'document_root': 'templates'}),
    path(r'logo512.png', serve, kwargs={'path': 'logo512.png', 'document_root': 'templates'}),
    path(r'manifest.json', serve, kwargs={'path': 'manifest.json', 'document_root': 'templates'}),
    path(r'robots.txt', serve, kwargs={'path': 'robots.txt', 'document_root': 'templates'})
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
