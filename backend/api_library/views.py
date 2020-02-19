import django_filters

from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Author, Book
from .serializers import AuthorSerializer, BookSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
