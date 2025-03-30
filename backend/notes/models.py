from django.db import models
from users.models import CustomUser

class Note(models.Model):
    VISIBILTY_CHOICES=[
        ('private','Private'),
        ('public','Public'),
    ]
    title=models.CharField(max_length=200)
    content=models.TextField()
    author=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='notes')
    visibility=models.CharField(max_length=10,choices=VISIBILTY_CHOICES,default='private')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        ordering=['-created_at']
    def __str__(self):
        return self.title 

class Tag(models.Model):
    name=models.CharField(max_length=50,unique=True)
    notes=models.ManyToManyField(Note,related_name='tags')       
    def __str__(self):
        return self.name