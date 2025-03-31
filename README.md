## iNotebook - Personal Notes Management System

iNotebook is a full-stack web application for creating, managing, and sharing notes publically . Built with Django REST Framework backend and vanilla JavaScript frontend, it provides a secure and intuitive platform for note-taking.

## Features
1. 🔐 User Authentication: Secure signup, login, and password management
2. 📝 Note Management: Create, read, update, and delete personal notes
3. 🔍 Advanced Search: Filter notes by title, content, and other attributes
4. 🔄 Sorting Options: Order notes by creation date, update date, etc.
5. 👁️ Visibility Control: Set notes as public or private
6. 👤 User Profiles: View and edit user information
7. 📊 Statistics Dashboard: Track note counts and user activity

## Technologies Used
### Backend
1. Django 5.1 (Python web framework)
2. Django REST Framework (API development)
3. SimpleJWT (Token-based authentication)
4. SQLite (Database)
### Frontend
1. HTML5, CSS3, JavaScript
2. FontAwesome (Icons)
3. Custom responsive design

## Setup Instructions
1. Clone the repository
```
git clone https://github.com/Himanshigupta1624/notemaker.git
```
2. Set up a virtual environment
```
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```
3. Install dependencies
```
pip install -r requirements.txt
```
4. Run migrations
```
cd backend
python manage.py makemigrations
python manage.py migrate
```
5. Create a superuser
```
python manage.py createsuperuser
```
6. Start the development server
```
python manage.py runserver
```
7. Serve the frontend (using live-server or similar)
```
cd ../frontend
# Using live-server (npm package)
live-server
```
## Usage
1. Sign up or log in to access your personal dashboard
2. Create notes with title, content, and visibility settings
3. Manage your notes through the intuitive dashboard
4. Search and sort to find specific notes quickly
5. Share notes by setting them as public
6. View public notes from other users for inspiration
## Screenshots

### Main 
![Main Page](/screenshots/main.png)
### Login & Registration
![Login Page](/screenshots/login.png)
![Registration Page](/screenshots/register.png)
*Secure user authentication with login and registration options*

### Dashboard
![Dashboard](/screenshots/dashboard.png)
*Main dashboard showing personal notes with search and filter options*

### Create/Edit Note
![Note Editor](/screenshots/Edit.png)
*Rich text editor for creating and editing notes with visibility controls*

### Public Notes
![Public Notes](/screenshots/public-notes.png)
*Browse public notes shared by other users*

### User Profile
![User Profile](/screenshots/profile.png)
*User profile with statistics and account management options*

### User  Information
![User Profile](/screenshots/users-info.png)
*User Information*


