# Generated by Django 4.2.5 on 2023-12-05 15:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tnd3d', '0008_remove_rootfile_jrf_alter_rootfile_uploaded_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkspaceRoot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('root', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tnd3d.rootfile', verbose_name='Root file')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tnd3d.workspace', verbose_name='Workspace')),
            ],
            options={
                'verbose_name': 'ROOT file to workspace assign',
                'verbose_name_plural': 'ROOT file to workspace assigns',
                'ordering': ('root',),
                'unique_together': {('workspace', 'root')},
            },
        ),
    ]
