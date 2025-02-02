import os
import google.generativeai as genai
from django.http import JsonResponse
from rest_framework import status
from healthcare_backend import settings
import json
import base64
import uuid

def chat_gemini_(request, vector_store):

    if settings.request_count >= settings.request_count_max:
        return JsonResponse({'error': 'Request limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    relevant_document = ''

    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        image_data = data.get('image', None)
        video_data = data.get('video', None)
        reference_content = data.get('reference_content', '')

        if video_data:
            video_bytes = base64.b64decode(video_data.split(',')[1])
            video_filename = f"video_{uuid.uuid4()}.mp4"

            # # Save the video to the desired location
            # with open(os.path.join('./', video_filename), 'wb') as f:
            #     f.write(video_bytes)

            # # Update the video_data with the saved filename
            # video_data = video_filename    

        # Retrieve the most relevant document chunks
        if user_input:
            relevant_document = vector_store.similarity_search(user_input)
            print(f'relevant_document: {relevant_document}')

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    system_message = f"You are a helpful assistant. This is the refereence content: {reference_content}"
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel("gemini-1.5-flash")
    content = system_message


    for msg in chat_messages:
        msg.pop('image', None)


    prompt = f"""
                {system_message}

                Below is the conversation history:
                {chat_messages}

                Continue the conversation based on the user's request. Prioritize responding directly to the user’s question, using the relevant document only if it is necessary to provide additional context or clarification.

                Relevant Document (for reference only):
                {relevant_document or ''}

                Note: Along with the current user medical condition related convervation, provide all possible preliminary First-Aid suggestions.

                Please provide your response below (output in JSON (keys: response, firstaid). Do not inlude markup language in the response and return output in string form for first aid. The first aid should be step by step instructions, neatly documented in markup text based on users current conversation history, reference content and user message):
                Strictly, provide first aid content in text and markup format only.
                User: {user_input}
                """
    
    try:
        response = model.generate_content(prompt)
    except Exception as e:
        print(f'Error: {e}')
        return JsonResponse({'error': str(e)}, status=500)
    
    response = response.text.replace("```json","").replace("```","").strip()
    print(f'response: {response}')
    response = json.loads(response)

    # increease the request count
    settings.request_count += 1

    return response
