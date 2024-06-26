# Generated by Django 4.2.5 on 2023-11-27 08:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tnd3d', '0004_alter_workspacecell_unique_together'),
    ]

    operations = [
        migrations.CreateModel(
            name='RootFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, unique=True, verbose_name='Display file name')),
                ('description', models.TextField(blank=True, default='', verbose_name='File description')),
                ('file_path', models.CharField(max_length=255, unique=True, verbose_name='Logs file from ROOT')),
                ('jrf', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='tnd3d.jobrootfile')),
            ],
            options={
                'verbose_name': 'Root file',
                'verbose_name_plural': 'Root files',
                'ordering': ('title',),
            },
        ),
    ]
