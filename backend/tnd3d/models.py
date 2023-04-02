from django.db import models
from django.utils.translation import gettext_lazy as _


class Job(models.Model):
    STATUS = [
        ('TODO', 'TODO'),
        ('PENDING', 'PENDING'),
        ('DONE', 'DONE'),
    ]

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Creation date'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Last updated'))
    title = models.CharField(max_length=64, verbose_name=_('Jobs title'))
    description = models.TextField(blank=True, default='', verbose_name=_('Jobs description'))
    status = models.CharField(max_length=16, choices=STATUS, default='TODO', verbose_name=_('Current status'))
    is_error = models.BooleanField(default=False, verbose_name=_('Finish with errors'))

    class Meta:
        ordering = ('created_at',)
        verbose_name = _('Job')
        verbose_name_plural = _('Jobs')
