from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse, HttpResponse
from contrib.wl_test.serializer import WLUploadedFileSerializer

from django.utils.translation import gettext_lazy as _
import contrib.wl_test.WLTest as WL

class WLTextView(APIView):
    def get(self, request):
        path = request.query_params.get('filename') 
        bb_size = int(request.query_params.get('bb_size'))
        result = WL.get_text_results(path, bb_size)
        return Response(result, status=200)

class WLPlotsView(APIView):
    def get(self, request, format=None):
        sources_path = request.query_params.get('filename')
        bb_size = int(request.query_params.get('bb_size'))
        in_memory_zip = WL.get_images(sources_path, bb_size)
        response = HttpResponse(in_memory_zip.read(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename=plots_with_metadata.zip'
        return response

class WLPdfView(APIView):
    def get(self, request):
        sources_path = request.query_params.get('filename') 
        bb_size = int(request.query_params.get('bb_size'))
        result_path = WL.get_pdf(sources_path, bb_size)
        try:
            return FileResponse(open(result_path, 'rb'), as_attachment=True, filename='report.pdf', content_type='application/pdf')
        except FileNotFoundError:
            return Response({"error": "PDF not found"}, status=status.HTTP_404_NOT_FOUND)

class WLFileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = WLUploadedFileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=201)
        else:
            return Response(file_serializer.errors, status=400)