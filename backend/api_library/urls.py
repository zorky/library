# coding=utf-8
# api_library/urls.py

from django.conf.urls import url, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'authors', views.AuthorViewSet, 'authors')
router.register(r'books', views.BookViewSet, 'books')
router.register(r'loans', views.LoansViewSet, 'loans')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'', include(router.urls)),
    url(r'^usergroups', views.get_roles, name='groups'),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]