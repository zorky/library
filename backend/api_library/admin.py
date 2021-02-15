from django.contrib import admin

# Register your models here.
from .models import Author, Book, Loan

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Loan)
