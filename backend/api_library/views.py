# api_library/views.py

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny

from .models import Author, Book
from .serializers import AuthorSerializer, BookSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.prefetch_related('books').all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]
    filter_backends =  (DjangoFilterBackend, SearchFilter, OrderingFilter, )

    search_fields = ['first_name', 'last_name']
    filterset_fields = ('last_name',)
    ordering_fields = ('id', 'last_name',)

    ordering = ['first_name', '-last_name']

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter,)

    search_fields = ['name', 'author__first_name', 'author__last_name']
    filterset_fields = ('name', 'nb_pages', 'author', 'author__last_name', 'author__first_name',)
    ordering_fields = ('id', 'name',)

    pagination_class = LimitOffsetPagination
    page_size = 10