import math

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
