from django.apps import AppConfig

class ApiLibraryConfig(AppConfig):
    name = 'api_library'
    module = 'backend'
    webapi_url = {"regex": "^library/", "module_url": "urls"}