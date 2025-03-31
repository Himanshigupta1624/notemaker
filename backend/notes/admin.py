from django.contrib import admin
from .models import Note
class NoteAdmin(admin.ModelAdmin):
    list_display=('title', 'author', 'visibility', 'created_at', 'updated_at')
    list_filter=('visibility', 'created_at','updated_at')
    search_fields=('title', 'content', 'author__username', 'author__email')
    readonly_fields=('created_at', 'updated_at')
    
admin.site.register(Note,NoteAdmin)
 