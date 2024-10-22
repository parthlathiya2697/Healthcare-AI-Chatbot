from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='chat'),
    path('first-aid-suggestions/', views.first_aid_suggestions, name='first_aid_suggestions'),
    path('hospitals_suggestions/', views.hospitals_suggestions, name='hospitals_suggestions'),
    path('doctors_suggestions/', views.doctors_suggestions, name='doctors_suggestions'),
    path('hospitals/', views.hospital_list, name='hospital_list'),
    path('doctors/', views.doctor_list, name='doctor_list'),
]