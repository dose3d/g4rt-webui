from rest_framework import serializers

from tnd3d.models import Job, JobRootFile


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('id', 'status', 'ret_code', 'created_at', 'updated_at')


class JobSerializerPending(JobSerializer):
    class Meta(JobSerializer.Meta):
        read_only_fields = (*JobSerializer.Meta.read_only_fields, 'args', 'toml')


class JobRootFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRootFile
        fields = '__all__'
        read_only_fields = ('id', 'file_name', 'size')
