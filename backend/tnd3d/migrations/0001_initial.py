# Generated by Django 4.2.2 on 2023-07-03 14:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Creation date')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last updated')),
                ('title', models.CharField(max_length=64, verbose_name='Jobs title')),
                ('description', models.TextField(blank=True, default='', verbose_name='Jobs description')),
                ('status', models.CharField(choices=[('INIT', 'init'), ('QUEUE', 'queue'), ('RUNNING', 'running'), ('DONE', 'done')], default='init', max_length=16, verbose_name='Current status')),
                ('ret_code', models.IntegerField(blank=True, null=True, verbose_name='Return code of Dose3D process')),
                ('toml', models.TextField(blank=True, default='', verbose_name='Content of TOML file')),
                ('args', models.CharField(default='', max_length=255, verbose_name='Dose3D command line args')),
            ],
            options={
                'verbose_name': 'Job',
                'verbose_name_plural': 'Jobs',
                'ordering': ('created_at',),
            },
        ),
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Creation date')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last updated')),
                ('title', models.CharField(max_length=64, verbose_name='Jobs title')),
                ('description', models.TextField(blank=True, default='', verbose_name='Jobs description')),
            ],
            options={
                'verbose_name': 'Workspace',
                'verbose_name_plural': 'Workspaces',
                'ordering': ('created_at',),
            },
        ),
        migrations.CreateModel(
            name='WorkspaceCell',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pos', models.IntegerField(verbose_name='Position in workspace')),
                ('type', models.CharField(choices=[('m', 'markdown'), ('j', 'json')], max_length=1)),
                ('content', models.TextField(blank=True, default='', verbose_name='Cell content')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tnd3d.workspace', verbose_name='Workspace')),
            ],
            options={
                'verbose_name': 'Workspace cell',
                'verbose_name_plural': 'Workspace cells',
                'ordering': ('pos',),
                'unique_together': {('workspace', 'pos')},
            },
        ),
        migrations.CreateModel(
            name='JobRootFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=255, verbose_name='File from ROOT')),
                ('size', models.IntegerField(default=0, verbose_name='File size')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tnd3d.job')),
            ],
            options={
                'verbose_name': 'Root file',
                'verbose_name_plural': 'Root files',
                'ordering': ('file_name',),
                'unique_together': {('job', 'file_name')},
            },
        ),
        migrations.CreateModel(
            name='JobLogFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=255, verbose_name='Logs file from ROOT')),
                ('size', models.IntegerField(default=0, verbose_name='File size')),
                ('is_output', models.BooleanField(default=False, verbose_name='This is logs from output of dose3d process')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tnd3d.job')),
            ],
            options={
                'verbose_name': 'Logs file',
                'verbose_name_plural': 'Logs files',
                'ordering': ('file_name',),
                'unique_together': {('job', 'file_name')},
            },
        ),
    ]