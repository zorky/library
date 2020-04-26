# api_library/views.py

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny

import logging
logger = logging.getLogger('django')

from .filters import BookFilter, AuthorFilter
from .models import Author, Book
from .serializers import AuthorSerializer, BookSerializer, BookAuthorSimpleSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.prefetch_related('books').all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]
    filter_backends =  (DjangoFilterBackend, SearchFilter, OrderingFilter, )
    filterset_class = AuthorFilter

    search_fields = ['first_name', 'last_name']
    ordering_fields = ('id', 'last_name', 'books__name',)

    ordering = ['first_name', '-last_name']

    pagination_class = LimitOffsetPagination
    page_size = 10

class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter,)
    filterset_class = BookFilter

    search_fields = ['name', 'author__first_name', 'author__last_name']
    ordering_fields = ('id', 'name',)

    pagination_class = LimitOffsetPagination
    page_size = 10

    def get_queryset(self):
        qs = Book.objects.prefetch_related('author__books').select_related('author')
        return qs

    def list(self, request, *args, **kwargs):
        logger.debug('list books : {}'.format(self.request.user))
        return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == 'list':
            return BookAuthorSimpleSerializer

        return self.serializer_class

    def get_serializer_context(self):
        return super().get_serializer_context()

