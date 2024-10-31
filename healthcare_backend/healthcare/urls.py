from django.urls import path
from . import views

urlpatterns = [
    path('chat_openai/', views.chat_openai, name='chat_openai'),
    path('chat_gemini/', views.chat_gemini, name='chat_gemini'),
    path('first_aid_suggestions_openai/', views.first_aid_suggestions_openai, name='first_aid_suggestions_openai'),
    path('hospitals_suggestions_openai/', views.hospitals_suggestions_openai, name='hospitals_suggestions_openai'),
    path('doctors_suggestions_openai/', views.doctors_suggestions_openai, name='doctors_suggestions_openai'),
    path('hospitals/', views.hospital_list, name='hospital_list'),
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('translate_audio/', views.translate_audio, name='translate_audio'),
    path('fetch_and_store_hospitals/', views.fetch_and_store_hospitals, name='fetch_and_store_hospitals'),
]