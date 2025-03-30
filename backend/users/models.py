from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager,PermissionsMixin

class CustomuserManager(BaseUserManager):
    def create_user(self,email,username,password=None,**extra_fields):
        if not email:
            raise ValueError('Users must have an email')
        if not username:
            raise ValueError('Users must have a username')
        
        email=self.normalize_email(email)
        user=self.model(email=email,username=username,**extra_fields)
        user.set_password(password)
        user.save(using=self.db)
        return user
    
    def create_superuser(self,email,username,password=None,**extra_fields):
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        extra_fields.setdefault('is_active',True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        return self.create_user(email,username,password,**extra_fields)
class CustomUser(AbstractBaseUser,PermissionsMixin)   :
    email=models.EmailField(unique=True)
    username=models.CharField(max_length=30,unique=True)
    first_name=models.CharField(max_length=50,blank=True )
    last_name=models.CharField(max_length=50,blank=True)
    is_active=models.BooleanField(default=True)
    is_staff=models.BooleanField(default=True)
    date_joined=models.DateTimeField(auto_now_add=True)
    
    objects=CustomuserManager()
    
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username']
    
    def __str__(self):
        return self.email
    
class Profile(models.Model):
    user=models.OneToOneField(CustomUser,on_delete=models.CASCADE)
    bio=models.TextField(blank=True)
    profile_pic=models.URLField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"