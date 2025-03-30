from rest_framework import serializers
from users.serializers import CustomSerializer
from .models import Note, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model=Tag
        fields=['id','name']
        
class NoteSerializer(serializers.ModelSerializer):
    author=CustomSerializer(read_only=True)
    tags=TagSerializer(many=True,required=False ,write_only=True) # type: ignore
    tag_list = TagSerializer(source='tags', many=True, read_only=True)
    
    class Meta:
        model=Note
        fields=['id','title','content','author','visibility','created_at','updated_at','tags','tag_list']  
        read_only_fields=['author','created_at','updated_at','tag_list']
        
    def create(self, validated_data):
        tags_data=validated_data.pop('tags',[])
        note=Note.objects.create(**validated_data)
        for tag_data in tags_data:
            tag,created=Tag.objects.get_or_create(name=tag_data['name'])
            note.tags.add(tag)
        return note     
     
    def update(self, instance, validated_data):
        # Extract the tags data
        tags_data = validated_data.pop('tags', [])
        
        # Update the note fields
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.visibility = validated_data.get('visibility', instance.visibility)
        instance.save()
        
        # Handle tags - clear existing ones and add new ones
        if tags_data:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag)
        
        return instance