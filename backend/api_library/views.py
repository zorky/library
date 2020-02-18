import django_filters

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Author
from .serializers import AuthorSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [AllowAny]
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)