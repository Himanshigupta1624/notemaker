from django.shortcuts import render
from rest_framework import viewsets,permissions,generics,filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Note, Tag
from .serializers import NoteSerializer,TagSerializer
from .permissions import IsAuthorOrReadOnly

class NoteViewset(viewsets.ModelViewSet):
    serializer_class=NoteSerializer
    permission_classes=[permissions.IsAuthenticated,IsAuthorOrReadOnly]
    filter_backends=[filters.SearchFilter,filters.OrderingFilter]
    search_fields=['title','content']
    ordering_fields=['created_at','updated_at','title']
    
    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user)|Note.objects.filter(visibility='public')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False,methods=['get'])
    def my_notes(self,request):
        notes=Note.objects.filter(author=request.user)
        filtered_notes = self.filter_queryset(notes)
        page=self.paginate_queryset(filtered_notes)
        if page is not None:
            serializer=self.get_serializer(page,many=True)    
            return self.get_paginated_response(serializer.data)
        serializer=self.get_serializer(filtered_notes,many=True)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        try:
          return super().update(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print("ERROR IN UPDATE:", str(e))
            print(traceback.format_exc())
            raise
    
    @action(detail=False,methods=['get'])
    def public(self,request):
        notes=Note.objects.filter(visibility='public')
        filtered_notes = self.filter_queryset(notes)
        page=self.paginate_queryset(filtered_notes)
        if page is not None:
            serializer=self.get_serializer(page,many=True)
            return self.get_paginated_response(serializer.data)
        serializer=self.get_serializer(filtered_notes,many=True)
        return Response(serializer.data)
    
class TagViewset(viewsets.ModelViewSet):
    queryset=Tag.objects.all()
    serializer_class=TagSerializer
    permission_classes=[permissions.IsAuthenticated]   
    @action(detail=True,methods=['get'])
    def notes(self,request,pk=None):
        tag=self.get_object()
        user=request.user
        notes=tag.notes.filter(visibility='public')|tag.notes.filter(author=user)
        serializer=NoteSerializer(notes,many=True)
        return Response(serializer.data)
                 