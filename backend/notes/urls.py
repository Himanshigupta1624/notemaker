from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import NoteViewset,TagViewset

router=DefaultRouter()
router.register(r'notes',NoteViewset,basename='note')
router.register(r'tags',TagViewset,basename='tag')

urlpatterns = [
    path('',include(router.urls)),
]

# frontend/
#   ├── css/
#   │   ├── main.css
#   │   ├── auth.css
#   │   ├── dashboard.css
#   │   └── notes.css
#   ├── js/
#   │   ├── auth.js
#   │   ├── dashboard.js
#   │   ├── notes.js
#   │   └── users.js
#   └── pages/
#       ├── index.html
#       ├── login.html
#       ├── register.html
#       ├── dashboard.html
#       ├── create-note.html
#       ├── view-note.html
#       ├── public-notes.html
#       ├── users.html
#       └── user-info.html