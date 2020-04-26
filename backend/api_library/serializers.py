# api_library/serializers.py

from rest_framework import serializers

from .models import Author, Book


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


class BookSerializer(serializers.ModelSerializer):
    author_obj = AuthorSerializer(source='author', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'

class BookAuthorSimpleSerializer(serializers.ModelSerializer):
    author_obj = AuthorSimpleSerializer(source='author', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'