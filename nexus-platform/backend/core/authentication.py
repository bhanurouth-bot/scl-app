# backend/core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Check if the token is in the cookie
        header = self.get_header(request)
        
        if header is None:
            raw_token = request.COOKIES.get('access_token') or None
        else:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except AuthenticationFailed:
            return None

        return self.get_user(validated_token), validated_token