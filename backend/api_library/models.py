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

    def __str__(self):
        return '{} : {}'.format(self.name, self.author)


