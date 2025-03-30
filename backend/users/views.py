from django.shortcuts import render
from .models import CustomUser,Profile
from rest_framework import generics,permissions,status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer,CustomSerializer,ChangePasswordSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from rest_framework.decorators import action

class RegisterView(generics.CreateAPIView):
    queryset=CustomUser.objects.all()
    serializer_class=CustomSerializer
    permission_classes=[permissions.AllowAny]
    
    def post(self,request,*args,**kwargs):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.save()
        
        refresh=RefreshToken.for_user(user)
        return Response({
            "user":CustomSerializer(user,context=self.get_serializer_context()).data,
            "refresh":str(refresh),
            "access":str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

class UserListView(generics.ListAPIView):
    queryset=CustomUser.objects.all()
    serializer_class=CustomSerializer
    permission_classes=[permissions.IsAuthenticated]
    
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset=CustomUser.objects.all()
    serializer_class=CustomSerializer
    permission_classes=[permissions.IsAuthenticated]
    
    def get_object(self):
        pk=self.kwargs.get('pk')
        if pk=='me':
            return self.request.user
        return super().get_object()        
    
    def delete(self, request, *args, **kwargs):
        user=self.get_object()
        if user!=request.user and not request.user.is_staff:
            return Response({
                "detail":"You do not have the permission to delete this user"
            },status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        user=self.get_object()
        if user !=request.user and not request.user.is_staff:
            return Response({"detail":"You do not have the permission to update this user"}
                            ,status=status.HTTP_403_FORBIDDEN)
        if 'password' in request.data or 'password2' in request.data:
            return Response({
                "detail":"Cannot Update the password through this endpoint"
            })    
        return super().update(request, *args, **kwargs)

class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk=None):
        # Get the user
        if pk == 'me'or request.path.endswith('/stats/me/'):
            user = request.user
        else:
            user = CustomUser.objects.get(pk=pk)
            
            # Optional permission check
            if user != request.user and not request.user.is_staff:
                return Response({"detail": "You do not have permission to view these stats"}, 
                               status=status.HTTP_403_FORBIDDEN)
        
        # Get the count of notes
        from notes.models import Note
        total_notes = Note.objects.filter(author=user).count()
        public_notes = Note.objects.filter(author=user, visibility='public').count()
        private_notes = total_notes - public_notes
        
        # Calculate days registered
        days_registered = (timezone.now().date() - user.date_joined.date()).days
        
        return Response({
            'total_notes': total_notes,
            'public_notes': public_notes,
            'private_notes': private_notes,
            'days_registered': days_registered
        })   
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class=ChangePasswordSerializer
    permission_classes=[permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user=self.get_object()
        serializer=self.get_serializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response({"old_password":["Wrong password"]},status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get("new_password"))
            user.save()
            refresh=RefreshToken.for_user(user)
            return Response({
                "detail":"Password updated sucessfully",
                "refresh":str(refresh),
                "access":str(refresh.access_token)
                
            },status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

class ProfileView(generics.RetrieveUpdateAPIView):
    queryset=Profile.objects.all()
    serializer_class=ProfileSerializer
    permission_classes=[permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user.profile 

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer   
        