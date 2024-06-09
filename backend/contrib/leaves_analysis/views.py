from rest_framework.views import APIView
from django.http import FileResponse, Http404, HttpResponse
import contrib.leaves_analysis.LA as LA
import os

from django.utils.translation import gettext_lazy as _

class LAPreprocessView(APIView):
    def get(self, request, format=None):
        filename = request.query_params.get('filename')
        params = {
            "threshold": int(request.query_params.get('threshold')),
            "SE_size": int(request.query_params.get('SE_size')),
            "sobel_kernel_size": int(request.query_params.get('sobel_kernel_size')),
        }

        in_memory_zip = LA.preprocess(filename, params)
        response = HttpResponse(in_memory_zip.read(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=analyzed_images.zip'
        return response

class LAAnalysisView(APIView):
    def get(self, request, format=None):
        filename = request.query_params.get('filename')
        leaves_filename = request.query_params.get('leaves_filename')
        params = {
            "x_mm": float(request.query_params.get('x_mm')),
            "y_mm": int(request.query_params.get('y_mm')),
            "tolerance_x": int(request.query_params.get('tolerance_x')),
            "tolerance_y": int(request.query_params.get('tolerance_y')),
            "permitted_errors_per_leaf": int(request.query_params.get('permitted_errors_per_leaf')),
            "threshold": int(request.query_params.get('threshold')),
            "SE_size": int(request.query_params.get('SE_size')),
            "sobel_kernel_size": int(request.query_params.get('sobel_kernel_size')),
        }

        in_memory_zip = LA.analyze(filename, leaves_filename, params)
        response = HttpResponse(in_memory_zip.read(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=analyzed_images.zip'
        return response