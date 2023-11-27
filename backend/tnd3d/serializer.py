import os
from rest_framework import serializers

from tnd3d.download import generate_download_href, MODULE_ROOT, MODULE_LOGS
from tnd3d.models import Job, JobRootFile, JobLogFile, Workspace, WorkspaceCell, WorkspaceJob, RootFile


class JobListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        exclude = ('toml', 'args')

    def save(self, **kwargs):
        pass  # it is readonly serializer


class JobRootFileSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()
    display = serializers.SerializerMethodField()

    class Meta:
        model = JobRootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size')

    def get_href(self, obj):
        return generate_download_href(MODULE_ROOT, obj.id)

    def get_display(self, obj):
        return os.path.basename(obj.file_name)


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
    display = serializers.SerializerMethodField()

    class Meta:
        model = JobLogFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size', 'is_output')

    def get_href(self, obj):
        return generate_download_href(MODULE_LOGS, obj.id)

    def get_display(self, obj):
        return os.path.basename(obj.file_name)


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


class RootFileSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()

    def get_href(self, obj):
        return "" #TODO generate_download_href(MODULE_ROOT, obj.id)

    class Meta:
        model = RootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_path', 'jrf')


class WorkspaceJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceJob
        fields = '__all__'


class WorkspaceSerializer(serializers.ModelSerializer):

    jobs = serializers.ListField(child=serializers.IntegerField())

    def create(self, validated_data):
        jobs = validated_data.pop('jobs')
        instance = Workspace.objects.create(**validated_data)

        for job in jobs:
            wj = WorkspaceJob.objects.create(workspace_id=instance.id, job_id=job)
            instance.workspacejob_set.add(wj)

        return instance

    def update(self, instance, validated_data):
        jobs = validated_data.pop('jobs')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        to_delete = set(instance.jobs)

        for job in jobs:
            if job in to_delete:
                to_delete.remove(job)
            else:
                WorkspaceJob.objects.create(workspace_id=instance, job_id=job)

        instance.workspacejob_set.filter(job_id__in=to_delete).delete()
        return instance

    class Meta:
        model = Workspace
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class WorkspaceCellSerializer(serializers.ModelSerializer):

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        if instance.pos % 2 == 1:
            instance.workspace.update_pos()
            return WorkspaceCell.objects.get(pk=instance.pk)

    class Meta:
        model = WorkspaceCell
        fields = '__all__'
        read_only_fields = ('id', 'workspace')


class WorkspaceCellCreateSerializer(WorkspaceCellSerializer):

    class Meta:
        model = WorkspaceCell
        fields = '__all__'
        read_only_fields = ('id',)
