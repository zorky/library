# coding=utf-8
from django.urls import reverse

from .serializers import UserSerializer


def jwt_response_payload_handler(token, user=None, request=None, issued_at=None):
    return {
        'pk': issued_at,
        'token': token,
        'user': UserSerializer(user, context={'request': request}).data,
        'refresh_url': reverse('api-token-refresh'),
        'token_verify_url': reverse('api-token-verify')
    }
