from django.contrib.auth.models import AbstractUser, User
from django.db import models

class TimeStampedModel(models.Model):
    """
    Classe utilitaire, champs dt_created / dt_updated
    """
    dt_created = models.DateTimeField(auto_now_add=True)
    dt_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Author(TimeStampedModel):
    first_name = models.CharField(max_length=50, null=False, blank=False)
    last_name = models.CharField(max_length=50, null=False, blank=False)

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

class Book(TimeStampedModel):
    name = models.CharField(max_length=100, null=False, blank=False, db_index=True)
    summary = models.TextField(null=True, blank=True)
    nb_pages = models.IntegerField()

    author = models.ForeignKey(Author,
                               related_name='books',
                               null=True,
                               on_delete=models.SET_NULL)

    enabled = models.BooleanField(default=True, help_text='disponible ou non')

    borrowers = models.ManyToManyField(User,
                                   through='Loan',
                                   through_fields=('book', 'user'),
                                   related_name='users_loans',
                                   help_text='les emprunts du livre')

    def __str__(self):
        return '{} : {}'.format(self.name, self.author)

class Loan(TimeStampedModel):
    """
    Les emprunts
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    in_progress = models.BooleanField(default=True)
    date_loan = models.DateTimeField(auto_now_add=True)
    date_return = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return '{} {}'.format(self.user, self.book)
