from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

import os, json
from openai import OpenAI

import base64  # Import base64 module here
import uuid

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
        image_data = data.get('image', None)  # Get the image if present
        video_data = data.get('video', None)  # Get the video if present

        # Save video data by converting frontend video blob to mp4 file
        if video_data:
            # Decode the base64 encoded video data
            video_bytes = base64.b64decode(video_data.split(',')[1])

            # Generate a unique filename for the video
            video_filename = f"video_{uuid.uuid4()}.mp4"

            # # Save the video to the desired location
            # with open(os.path.join('./', video_filename), 'wb') as f:
            #     f.write(video_bytes)

            # # Update the video_data with the saved filename
            # video_data = video_filename    

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Prepare the system message
    system_message = "You are a helpful assistant. User Chat till this point: " + str(chat_messages)

    # # Create a chat completion request
    # if image_data and user_input:
    #     print("Image and user input")
    #     completion = client.chat.completions.create(
    #             model="gpt-4o",
    #             messages=[
    #                 {
    #                     "role": "user",
    #                     "content": [
    #                         {"type": "text", "text": f"Analyze this image_data and provide an answer to the users question i.e., {user_input}"},
    #                         {"type": "image_url", "image_url": {"url": image_data}},
    #                     ],
    #                 },
    #             ],
    #         )
    # elif image_data and not user_input:
    #     print("Image and no user input")
    #     completion = client.chat.completions.create(
    #             model="gpt-4o",
    #             messages=[
    #                 {
    #                     "role": "user",
    #                     "content": [
    #                         {"type": "text", "text": f"Analyze this image_data and provide a response"},
    #                         {"type": "image_url", "image_url": {"url": image_data}},
    #                     ],
    #                 },
    #             ],
    #         )
    # else:
    #     print("No image and user input")
    #     completion = client.chat.completions.create(
    #         model="gpt-4o-mini",
    #         messages=[
    #             {"role": "system", "content": system_message},
    #             {"role": "user", "content": user_input}
    #         ],
    #     )

    # # Extract the response message
    # response_message = completion.choices[0].message.content

    # Return the response as JSON
    # return JsonResponse({'response': response_message})
    return JsonResponse({'response': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line


@csrf_exempt
def first_aid_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # # Parse JSON body data
    # try:
    #     data = json.loads(request.body)
    #     user_input = data.get('query', '')
    #     chat_messages = data.get('chat_messages', [])
    #     reference_content = data.get('reference_content', '')
    # except json.JSONDecodeError:
    #     return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # # Create a chat completion request
    # completion = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
    #         {"role": "user", "content": user_input}
    #     ]
    # )

    # # Extract the response message
    # response_message = completion.choices[0].message.content

    # Return the response as JSON
    # return JsonResponse({'suggestion': response_message})
    return JsonResponse({'suggestion': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line


@csrf_exempt
def hospitals_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # # Parse JSON body data
    # try:
    #     data = json.loads(request.body)
    #     user_input = data.get('query', '')
    #     chat_messages = data.get('chat_messages', [])
    #     reference_content = data.get('reference_content', '')
    # except json.JSONDecodeError:
    #     return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # # Create a chat completion request
    # completion = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
    #         {"role": "user", "content": user_input}
    #     ]
    # )

    # # Extract the response message
    # response_message = completion.choices[0].message.content

    # Return the response as JSON
    # return JsonResponse({'suggestion': response_message})
    return JsonResponse({'suggestion': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line


@csrf_exempt
def doctors_suggestions(request):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # # Parse JSON body data
    # try:
    #     data = json.loads(request.body)
    #     user_input = data.get('query', '')
    #     chat_messages = data.get('chat_messages', [])
    #     reference_content = data.get('reference_content', '')
    # except json.JSONDecodeError:
    #     return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # # Create a chat completion request
    # completion = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": "You are a helpful assistant. Reference: " + reference_content + " User Chat till this point: " + str(chat_messages)},
    #         {"role": "user", "content": user_input}
    #     ]
    # )

    # # Extract the response message
    # response_message = completion.choices[0].message.content

    # Return the response as JSON
    # return JsonResponse({'suggestion': response_message})
    return JsonResponse({'suggestion': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line




@csrf_exempt
def hospital_list(request):
    hospitals = list(Hospital.objects.values())
    return JsonResponse(hospitals, safe=False)

@csrf_exempt
def doctor_list(request):
    doctors = list(Doctor.objects.values())
    return JsonResponse(doctors, safe=False)

