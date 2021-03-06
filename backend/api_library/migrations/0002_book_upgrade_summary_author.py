# Generated by Django 3.0.5 on 2020-04-26 11:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api_library', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='book',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='books', to='api_library.Author'),
        ),
    ]
