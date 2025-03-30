from rest_framework import serializers
from .models import CustomUser,Profile
from django.contrib.auth.password_validation import validate_password

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Profile
        fields=['bio','profile_pic','created_at','updated_at']
        read_only_fields=['created_at','updated_at']

class CustomSerializer(serializers.ModelSerializer):
    profile=ProfileSerializer(read_only=True)
    password=serializers.CharField(write_only=True,required=True)
    password2=serializers.CharField(write_only=True,required=True)
    notes_count = serializers.SerializerMethodField()
    public_notes_count = serializers.SerializerMethodField()
    class Meta:
        model=CustomUser
        fields=['id','email','username','first_name','last_name','password','password2','profile',
                'date_joined','notes_count','public_notes_count']
        read_only_fields=['date_joined']
        
     # Method to calculate total notes count
    def get_notes_count(self, obj):
        from notes.models import Note
        return Note.objects.filter(author=obj).count()
    
    # Method to calculate public notes count
    def get_public_notes_count(self, obj):
        from notes.models import Note
        return Note.objects.filter(author=obj,visibility="public").count()
      
    def validate(self, attrs):
        if 'password' in attrs and 'password2' in attrs:
         if attrs['password']!=attrs['password2']:
            raise serializers.ValidationError({'password':"Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password=validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data ,password=password)
        return user
class ChangePasswordSerializer(serializers.Serializer):
    old_password=serializers.CharField(required=True)    
    new_password=serializers.CharField(required=True,validators=[validate_password])    
    new_password2=serializers.CharField(required=True)    
    def validate(self, attrs):
        if attrs['new_password']!=attrs['new_password2']:
            raise serializers.ValidationError({"new_password":"Password fields didn't match"})
        return attrs
               