import os
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from tnd3d.download import generate_download_href, MODULE_ROOT, MODULE_LOGS, MODULE_UPLOADS
from tnd3d.models import Job, JobRootFile, JobLogFile, Workspace, WorkspaceCell, WorkspaceJob, RootFile, UploadedFile, \
    WorkspaceRoot


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


class UploadedFileSerializer(serializers.ModelSerializer):
    def validate_file(self, value):
        # raise serializers.ValidationError(_("It is not a valid ROOT file. Please upload another file."))
        return value

    class Meta:
        model = UploadedFile
        fields = '__all__'


class RootFileSerializer(serializers.ModelSerializer):

    href = serializers.SerializerMethodField()

    def get_href(self, obj):
        return generate_download_href(MODULE_UPLOADS, obj.id)

    def validate_uploaded_file(self, value):
        if not value:
            raise serializers.ValidationError(_("Please upload ROOT file"))
        return value

    class Meta:
        model = RootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_path')


class WorkspaceJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceJob
        fields = '__all__'


class WorkspaceSerializer(serializers.ModelSerializer):

    jobs = serializers.ListField(child=serializers.IntegerField())
    roots = serializers.ListField(child=serializers.IntegerField())

    def create(self, validated_data):
        jobs = validated_data.pop('jobs')
        roots = validated_data.pop('roots')

        instance = Workspace.objects.create(**validated_data)

        for job in jobs:
            wj = WorkspaceJob.objects.create(workspace_id=instance.id, job_id=job)
            instance.workspacejob_set.add(wj)

        for root in roots:
            wr = WorkspaceRoot.objects.create(workspace_id=instance.id, root_id=root)
            instance.workspaceroot_set.add(wr)

        return instance

    def update(self, instance, validated_data):
        jobs = validated_data.pop('jobs')
        roots = validated_data.pop('roots')

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

        to_delete = set(instance.roots)
        for root in roots:
            if root in to_delete:
                to_delete.remove(root)
            else:
                WorkspaceRoot.objects.create(workspace_id=instance, root_id=root)
        instance.workspacejob_set.filter(root_id__in=to_delete).delete()

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
