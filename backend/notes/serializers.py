from rest_framework import serializers
from users.serializers import CustomSerializer
from .models import Note



        
class NoteSerializer(serializers.ModelSerializer):
    author=CustomSerializer(read_only=True)
    
    
    class Meta:
        model=Note
        fields=['id','title','content','author','visibility','created_at','updated_at']  
        read_only_fields=['author','created_at','updated_at']
        
    def create(self, validated_data):
        
        note=Note.objects.create(**validated_data)
        
        return note     
     
    def update(self, instance, validated_data):
       
        
        # Update the note fields
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.visibility = validated_data.get('visibility', instance.visibility)
        instance.save()
        
        
        
        return instance