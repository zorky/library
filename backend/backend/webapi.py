# coding=utf-8

from django.apps import apps
from django.conf.urls import url, include

def webapi():
    """
    Initialisation des urls des webapi
    fonction lisant l'attribut url des AppConfigs et forme les inclusions
    :return: urlpartterns (liste d'url des insclusions des applications
    :rtype: urlpartterns
    """
    urlpatterns = []

    for x in apps.get_app_configs():
        if getattr(x, 'webapi_url', None):
            urls = "{}.{}".format(x.module.__name__, x.webapi_url['module_url'])
            urlpatterns.append(url(x.webapi_url['regex'], include(urls)))
    print('{}'.format(urlpatterns))
    return urlpatterns