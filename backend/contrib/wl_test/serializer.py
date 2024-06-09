from rest_framework import serializers
from contrib.wl_test.models import WLUploadedFile

class WLUploadedFileSerializer(serializers.ModelSerializer):
    def validate_file(self, value):
        return value

    class Meta:
        model = WLUploadedFile
        fields = '__all__'
