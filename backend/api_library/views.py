# api_library/views.py
from django.contrib.auth.models import User
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, DjangoModelPermissions, \
    DjangoModelPermissionsOrAnonReadOnly, IsAuthenticated

import logging

from rest_framework.response import Response

from .permissions import IsGestionnaireOrReadOnly

logger = logging.getLogger('django')

from .filters import BookFilter, AuthorFilter, LoansFilter
from .models import Author, Book, Loan
from .serializers import AuthorSerializer, BookSerializer, BookAuthorSimpleSerializer, UserGroupsSerializer, \
    LoanSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roles(request):
    username = request.query_params.get('uid', None)
    if username:
        try:
            user = User.objects.get(username=username)
            serializer = UserGroupsSerializer(user, many=False)
            logger.debug('groups {}'.format(serializer.data))
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(status=status.HTTP_400_BAD_REQUEST)

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.prefetch_related('books').all()
    serializer_class = AuthorSerializer
    # permission_classes = [AllowAny]
    permission_classes = [IsGestionnaireOrReadOnly]
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter,)
    filterset_class = AuthorFilter

    search_fields = ['first_name', 'last_name', 'books__name']
    ordering_fields = ('id', 'last_name', 'books__name',)

    ordering = ['first_name', '-last_name']

    pagination_class = LimitOffsetPagination
    page_size = 10


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [IsGestionnaireOrReadOnly]
    # permission_classes = [IsAuthenticatedOrReadOnly]
    # permission_classes = [IsAuthenticated]
    # permission_classes = [AllowAny]
    # permission_classes = [DjangoModelPermissionsOrAnonReadOnly]
    # permission_classes = [DjangoModelPermissions]
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter,)
    filterset_class = BookFilter

    search_fields = ['name', 'author__first_name', 'author__last_name']
    ordering_fields = ('id', 'name', 'enabled', 'author__last_name',)

    pagination_class = LimitOffsetPagination
    page_size = 10

    def get_queryset(self):
        progress = self.request.query_params.get('in_progress', None)
        qs_load = Loan.objects.filter(in_progress=progress) if progress else Loan.objects.all()
        loans = Prefetch('loan_set',
                         queryset=qs_load
                           .select_related('user', 'book', ))
        qs = Book.objects\
            .prefetch_related('author__books', 'borrowers',
                              # 'loan_set',
                              loans)\
            .select_related('author', )
        # loans)\
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

class LoansViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LoanSerializer

    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter,)
    filterset_class = LoansFilter

    pagination_class = LimitOffsetPagination
    page_size = 10
