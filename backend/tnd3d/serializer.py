from rest_framework import serializers

from tnd3d.download import generate_download_href, MODULE_ROOT, MODULE_LOGS
from tnd3d.models import Job, JobRootFile


class JobListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        exclude = ('toml', 'args')

    def save(self, **kwargs):
        pass  # it is readonly serializer


class JobRootFileSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()

    class Meta:
        model = JobRootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size')

    def get_href(self, obj):
        return generate_download_href(MODULE_ROOT, obj.id)


class JobSerializer(serializers.ModelSerializer):

    root_files = JobRootFileSerializer(many=True, source='jobrootfile_set', read_only=True)
    logs_href = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('id', 'status', 'ret_code', 'created_at', 'updated_at')

    def get_logs_href(self, obj):
        return generate_download_href(MODULE_LOGS, obj.id)


class JobSerializerPending(JobSerializer):
    class Meta(JobSerializer.Meta):
        read_only_fields = (*JobSerializer.Meta.read_only_fields, 'args', 'toml')
