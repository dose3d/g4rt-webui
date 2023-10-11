from rest_framework import serializers

from tnd3d.download import generate_download_href, MODULE_ROOT, MODULE_LOGS
from tnd3d.models import Job, JobRootFile, JobLogFile, Workspace, WorkspaceCell, WorkspaceJob


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


class JobRootFileDetailSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()
    job = JobListSerializer()

    class Meta:
        model = JobRootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size')

    def get_href(self, obj):
        return generate_download_href(MODULE_ROOT, obj.id)


class JobLogFileSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()

    class Meta:
        model = JobLogFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size', 'is_output')

    def get_href(self, obj):
        return generate_download_href(MODULE_LOGS, obj.id)


class JobSerializer(serializers.ModelSerializer):

    root_files = JobRootFileSerializer(many=True, source='jobrootfile_set', read_only=True)
    logs_files = JobLogFileSerializer(many=True, source='joblogfile_set', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('id', 'status', 'ret_code', 'created_at', 'updated_at')


class JobSerializerPending(JobSerializer):
    class Meta(JobSerializer.Meta):
        read_only_fields = (*JobSerializer.Meta.read_only_fields, 'args', 'toml')


class WorkspaceJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceJob
        fields = '__all__'


class WorkspaceSerializer(serializers.ModelSerializer):

    jobs = WorkspaceJobSerializer(many=True, source='workspacejob_set')

    class Meta:
        model = Workspace
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class WorkspaceCellSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkspaceCell
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'pos')


class WorkspaceCellCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkspaceCell
        fields = '__all__'
        read_only_fields = ('id', 'pos')
