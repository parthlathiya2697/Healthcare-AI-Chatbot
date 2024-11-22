import os
from openai import OpenAI
from django.http import JsonResponse
from rest_framework import status
from healthcare_backend import settings
import json
import base64
import uuid


def chat_openai_(request, vector_store):

    if settings.request_count >= settings.request_count_max:
        return JsonResponse({'error': 'Request limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    relevant_document = ''
    # Parse JSON body data
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        image_data = data.get('image', None)  # Get the image if present
        video_data = data.get('video', None)  # Get the video if present
        reference_content = data.get('reference_content', '')

        # Save video data by converting frontend video blob to mp4 file
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

    # Prepare the system message
    system_message = f"You are a helpful assistant. This is the refereence content: {reference_content or ''}"



    for msg in chat_messages:
            msg.pop('image', None)

    
    prompt = f"""
                {system_message}

                Below is the conversation history:
                {chat_messages}

                Continue the conversation based on the user's request. Prioritize responding directly to the user’s question, using the relevant document only if it is necessary to provide additional context or clarification.

                Relevant Document (for reference only):
                {reference_content or ''}

                Note: Along with the current user medical condition related convervation, provide all possible preliminary First-Aid suggestions.

                Please provide your response below (output in JSON (keys: response, firstaid). Do not inlude markup language in the response and return output in string form for first aid. The first aid should be step by step instructions, neatly documented in markup text based on users current conversation history, reference content and user message):
                User: {user_input}
                """
    

    # Create a chat completion request
    if image_data and user_input:
        print("Image and user input")
        prompt += 'Analyze this image_data and provide an answer to the users question respectively.'
        completion = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_data}},
                        ],
                    },
                ],
            )
    elif image_data and not user_input:
        print("Image and no user input")
        prompt += 'Analyze this image_data and provide a response';
        completion = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_data}},
                        ],
                    },
                ],
            )
    else:
        print("No image and user input")
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
        )

    # Extract the response message
    response_message = completion.choices[0].message.content

    response = response_message.replace("```json","").replace("```","").strip()
    print(f'response: {response}')
    response = json.loads(response)

        # increease the request count
    settings.request_count += 1

    return response