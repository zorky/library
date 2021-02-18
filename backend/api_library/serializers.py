# api_library/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Author, Book, Loan

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class BookSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class AuthorSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    books_obj = BookSimpleSerializer(source='books', many=True, read_only=True)

    class Meta:
        model = Author
        fields = '__all__'

class LoanSimpleSerializer(serializers.ModelSerializer):
    # user_obj = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Loan
        fields = '__all__'

class LoanBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    author_obj = AuthorSerializer(source='author', read_only=True)
    # borrowers_obj = UserSerializer(source='borrowers', many=True, read_only=True)

    class Meta:
        model = Book
        fields = ('id', 'name', 'summary', 'nb_pages', 'enabled',
                  'dt_created', 'dt_updated',
                  'borrowers',
                  'author_obj', )

class BookAuthorSimpleSerializer(serializers.ModelSerializer):
    author_obj = AuthorSimpleSerializer(source='author', read_only=True)
    borrowers_obj = UserSerializer(source='borrowers', many=True, read_only=True)
    loans_obj = LoanSimpleSerializer(source='loan_set', many=True, read_only=True)

    class Meta:
        model = Book
        fields = '__all__'
        # fields = ['id', 'name', 'summary', 'nb_pages', 'enabled', 'borrowers',
        #          'author_obj', 'borrowers_obj', 'loans_obj',]


class UserGroupsSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()

    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]

    class Meta:
        model = User
        fields = ['username', 'groups',
                  'user_permissions',
                  'first_name', 'last_name',
                  'is_active', 'date_joined']

class LoanSerializer(serializers.ModelSerializer):
    book_obj = BookSerializer(source='book', read_only=True)
    user_obj = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'user', 'book', 'in_progress', 'date_loan', 'date_return',
                  'book_obj', 'user_obj',]
