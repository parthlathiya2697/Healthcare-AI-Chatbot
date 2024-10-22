from django.shortcuts import render

import os
from openai import OpenAI

# Create your views here.
from django.http import JsonResponse
from .models import Hospital, Doctor


def chat(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Get user input from request (assuming it's sent as a query parameter)
    user_input = request.GET.get('message', '')

    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'response': response_message})


def first_aid_suggestions(request):
    # Initialize OpenAI client
    print(f'API KEY: {os.getenv("OPENAI_API_KEY")}')
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Get user input from request (assuming it's sent as a query parameter)
    user_input = request.GET.get('query', '')

    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})


def hospital_list(request):
    hospitals = list(Hospital.objects.values())
    return JsonResponse(hospitals, safe=False)

def doctor_list(request):
    doctors = list(Doctor.objects.values())
    return JsonResponse(doctors, safe=False)

