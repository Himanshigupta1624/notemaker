from django.urls import path
from .views  import(
    RegisterView,CustomTokenObtainPairView,UserListView,UserDetailView,ChangePasswordView,ProfileView,UserStatsView
)
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView,TokenVerifyView

urlpatterns = [
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',CustomTokenObtainPairView.as_view(),name='token_obtain'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('users/',UserListView.as_view(),name='user_list'),
    path('users/<str:pk>/',UserDetailView.as_view(),name='user_detail'),
    path('users/password/change/',ChangePasswordView.as_view(),name='change_password'),
    path('profile/',ProfileView.as_view(),name='profile'),
    path('users/<str:pk>/stats/', UserStatsView.as_view(),name='user_stats'),
    path('users/stats/me/', UserStatsView.as_view(),name='my_stats'),
    
]