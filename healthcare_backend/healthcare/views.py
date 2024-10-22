from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

import os, json
from openai import OpenAI

# Create your views here.
from django.http import JsonResponse
from .models import Hospital, Doctor

@csrf_exempt
def chat(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Parse JSON body data
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. User Chat till this point : " + str(chat_messages)},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'response': response_message})


@csrf_exempt
def first_aid_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Parse JSON body data
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        reference_content = data.get('reference_content', '')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})


@csrf_exempt
def hospitals_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Parse JSON body data
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        reference_content = data.get('reference_content', '')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})


@csrf_exempt
def doctors_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # Parse JSON body data
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        reference_content = data.get('reference_content', '')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Create a chat completion request
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
            {"role": "user", "content": user_input}
        ]
    )

    # Extract the response message
    response_message = completion.choices[0].message.content

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})




@csrf_exempt
def hospital_list(request):
    hospitals = list(Hospital.objects.values())
    return JsonResponse(hospitals, safe=False)

@csrf_exempt
def doctor_list(request):
    doctors = list(Doctor.objects.values())
    return JsonResponse(doctors, safe=False)

