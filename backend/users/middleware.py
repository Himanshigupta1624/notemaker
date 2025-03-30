from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
import logging
logger = logging.getLogger(__name__)

class CustomAuthMiddleware(MiddlewareMixin):
    """Custom middleware for JWT authentication"""
    def process_request(self, request):
        """Process JWT auth for relevant API paths"""
        # Skip authentication for specific paths
        if not request.path.startswith('/api/') or \
            request.path.startswith('/api/login/') or \
            request.path.startswith('/api/register/') or \
            request.path.startswith('/api/token/refresh/'):
                return None
        
        # Get auth header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            # Don't log missing auth headers for better security
            return None
        
        # Create JWT authentication instance
        jwt_auth = JWTAuthentication()
        try:
            # Use the built-in authenticate method which handles all the token validation
            auth_result = jwt_auth.authenticate(request)
            if auth_result:
                request.user, _ = auth_result
                logger.info(f"User {request.user.username} authenticated via middleware")
        except (InvalidToken, AuthenticationFailed) as e:
            logger.warning(f"Auth Failed in middleware: {str(e)}")
        
        # Always return None to continue processing
        return None