import django_filters
from django.db.models import Q
from django_filters import FilterSet, filters, BaseInFilter, NumberFilter, BooleanFilter

from .models import Book, Author, Loan


class IntegerInFilter(BaseInFilter, NumberFilter):
    pass

class AuthorFilter(FilterSet):
    last_name = filters.CharFilter(lookup_expr='iexact')
    first_name = filters.CharFilter(lookup_expr='iexact')
    by_search = filters.CharFilter(method="get_by_search")
    book = django_filters.CharFilter(method='get_by_book')

    def get_by_book(self, queryset, name, value):
        """
        Recherche de l'auteur d'un livre
        """
        return queryset.filter(books__pk=value)

    def get_by_search(self, queryset, name, value):
        """
        Search mot à mot
        """
        words = value.split(' ')

        filters = Q()
        for word in words:
            filters |= Q(first_name__icontains=word) | Q(last_name__icontains=word)

        qs = queryset.filter(filters)
        return qs

    class Meta:
        model = Author
        fields = ['id', 'last_name', 'first_name', 'book',]

class BookFilter(FilterSet):
    pages =  filters.RangeFilter(field_name='nb_pages')
    author__in = IntegerInFilter(field_name='author', lookup_expr='in')
    author_isnull = BooleanFilter(field_name='author', lookup_expr='isnull')

    class Meta:
        model = Book
        fields = ['name', 'nb_pages', 'author', 'author__last_name', 'author__first_name', 'enabled']


class LoansFilter(FilterSet):
    class Meta:
        model = Loan
        fields = '__all__'