import math

from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000

    def get_paginated_response(self, data):
        from collections import OrderedDict
        page_size = int(self.request.query_params.get('page_size', self.page_size))
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('pages_count', math.ceil(self.page.paginator.count / page_size)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))


class VariousSerializersViewSet(viewsets.ModelViewSet):
    retrieve_serializer_class = None
    list_serializer_class = None
    create_serializer_class = None
    update_serializer_class = None
    destroy_serializer_class = None

    def get_serializer_class(self):
        sc = getattr(self, '%s_serializer_class' % self.action, self.serializer_class)
        if sc is None:
            return super().get_serializer_class()
        return sc
