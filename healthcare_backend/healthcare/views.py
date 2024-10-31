import PyPDF2
import os, json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from openai import OpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
# from langchain.document_loaders import PyPDFLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

import base64
import uuid
import soundfile as sf
import io
from django.http import JsonResponse
from .models import Hospital, Doctor
import google.generativeai as genai


import random
def get_staff_behavior(hospital):
    # Your logic to extract staff behavior score
    return 1

def get_treatment_score(hospital):
    # Your logic to extract treatment score
    return 1

def create_vector_store():
    # Create a vector store on server startup
    pdf_folder = "./health_dataset"  # Replace with your actual PDF folder path
    pdf_files = [os.path.join(pdf_folder, f) for f in os.listdir(pdf_folder) if f.endswith(".pdf")]

    # Load and split PDF documents
    loader = PyPDFLoader
    documents = []
    for pdf_file in pdf_files:
        # Use the file path instead of the file object
        with open(pdf_file, 'rb') as f:
            loader = PyPDFLoader(pdf_file)  # Pass the file path here
            documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.create_documents([doc.page_content for doc in documents])  # Extract page_content

    # Create a vector store
    embeddings = OpenAIEmbeddings()
    global vector_store
    vector_store = FAISS.from_documents(texts, embeddings)

# Call the function to create the vector store on server startup
create_vector_store()




# @csrf_exempt
# def chat_gemini(request):

#     # Parse JSON body data
#     try:
#         data = json.loads(request.body)
#         user_input = data.get('query', '')
#         chat_messages = data.get('chat_messages', [])
#         image_data = data.get('image', None)  # Get the image if present
#         video_data = data.get('video', None)  # Get the video if present

#         # Save video data by converting frontend video blob to mp4 file
#         if video_data:
#             # Decode the base64 encoded video data
#             video_bytes = base64.b64decode(video_data.split(',')[1])

#             # Generate a unique filename for the video
#             video_filename = f"video_{uuid.uuid4()}.mp4"

#             # # Save the video to the desired location
#             # with open(os.path.join('./', video_filename), 'wb') as f:
#             #     f.write(video_bytes)

#             # # Update the video_data with the saved filename
#             # video_data = video_filename    

#     except json.JSONDecodeError:
#         return JsonResponse({'error': 'Invalid JSON'}, status=400)

#     # Prepare the system message
#     system_message = "You are a helpful assistant. User Chat till this point: " + str(chat_messages)

#     # # Create a chat completion request
#     # if image_data and user_input:
#     #     print("Image and user input")
#     #     completion = client.chat.completions.create(
#     #             model="gpt-4o",
#     #             messages=[
#     #                 {
#     #                     "role": "user",
#     #                     "content": [
#     #                         {"type": "text", "text": f"Analyze this image_data and provide an answer to the users question i.e., {user_input}"},
#     #                         {"type": "image_url", "image_url": {"url": image_data}},
#     #                     ],
#     #                 },
#     #             ],
#     #         )
#     # elif image_data and not user_input:
#     #     print("Image and no user input")
#     #     completion = client.chat.completions.create(
#     #             model="gpt-4o",
#     #             messages=[
#     #                 {
#     #                     "role": "user",
#     #                     "content": [
#     #                         {"type": "text", "text": f"Analyze this image_data and provide a response"},
#     #                         {"type": "image_url", "image_url": {"url": image_data}},
#     #                     ],
#     #                 },
#     #             ],
#     #         )
#     # else:
#     #     print("No image and user input")
#     #     completion = client.chat.completions.create(
#     #         model="gpt-4o-mini",
#     #         messages=[
#     #             {"role": "system", "content": system_message},
#     #             {"role": "user", "content": user_input}
#     #         ],
#     #     )

#     # # Extract the response message
#     # response_message = completion.choices[0].message.content

#     # Return the response as JSON
#     # return JsonResponse({'response': response_message})
#     # return JsonResponse({'response': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line
#     genai.configure(api_key='AIzaSyASEjuFeJICbV8E6LRhMgxzkNMwYkpfm7Y')
#     model = genai.GenerativeModel("gemini-1.5-flash")
#     content = system_message
#     response = model.generate_content(f'Continue this conversation with your answer. Reply in simple sentence and not in json: {content}')
#     response = response.text
#     return JsonResponse({'response': response})



    


@csrf_exempt
def chat_openai(request):
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

        # Retrieve the most relevant document chunks
        relevant_document = vector_store.similarity_search(user_input)

        print(f'relevant_document: {relevant_document}')

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Prepare the system message
    system_message = "You are a helpful assistant. \n\n[ Relevant info: {relevant_document}]. User Chat till this point: " + str(chat_messages)

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



# from langchain.document_loaders import PyPDFLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
@csrf_exempt
def chat_gemini(request):
    try:
        data = json.loads(request.body)
        user_input = data.get('query', '')
        chat_messages = data.get('chat_messages', [])
        image_data = data.get('image', None)
        video_data = data.get('video', None)

        if video_data:
            video_bytes = base64.b64decode(video_data.split(',')[1])
            video_filename = f"video_{uuid.uuid4()}.mp4"

        # Retrieve the most relevant document chunks
        relevant_document = vector_store.similarity_search(user_input)
        relevant_document = ''

        print(f'relevant_document: {relevant_document}')

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    system_message = f"You are a helpful assistant."

    genai.configure(api_key='AIzaSyASEjuFeJICbV8E6LRhMgxzkNMwYkpfm7Y')
    model = genai.GenerativeModel("gemini-1.5-flash")
    content = system_message
    prompt = f"""
                {system_message}

                Below is the conversation history:
                {chat_messages}

                Continue the conversation based on the user's request. Prioritize responding directly to the user’s question, using the relevant document only if it is necessary to provide additional context or clarification.

                Relevant Document (for reference only):
                {relevant_document}

                Note: Along with the current user medical condition related convervation, provide all possible preliminary First-Aid suggestions.

                Please provide your response below (output in JSON (keys: response, firstaid). Do not inlude markup language in the response):
                User: {user_input}
                """
    response = model.generate_content(prompt)
    response = response.text.replace("```json","").replace("```","").strip()
    print(f'response: {response}')
    response = json.loads(response)
    return JsonResponse({'response': response})



@csrf_exempt
def first_aid_suggestions_openai(request):
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
def hospitals_suggestions_openai(request):
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
def doctors_suggestions_openai(request):
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

def convert_to_wav(input_audio_file):
    # Read the audio file using audioread and soundfile
    with io.BytesIO() as buffer:
        # Open the input audio file with soundfile
        with sf.SoundFile(input_audio_file) as file:
            # Write audio data to a WAV buffer
            with sf.SoundFile(buffer, mode='w', samplerate=file.samplerate, channels=file.channels, format='WAV') as output:
                output.write(file.read(dtype='float32'))
        buffer.seek(0)
        return buffer


@require_POST
@csrf_exempt
def translate_audio(request):
    audio_file = request.FILES.get('audio_file')

    # if audio_file:
    #     client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    #     try:
    #         # Check if the file is in-memory or a temporary file
    #         if hasattr(audio_file, 'temporary_file_path'):
    #             # File is stored as a temporary file
    #             input_path = audio_file.temporary_file_path()
    #         else:
    #             # File is in-memory, save it to a temporary file
    #             with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_input_file:
    #                 # Write the in-memory file content to a temporary file
    #                 for chunk in audio_file.chunks():
    #                     temp_input_file.write(chunk)
    #                 input_path = temp_input_file.name

    #         # Create a temporary file for the WAV output
    #         with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_wav_file:
    #             wav_file_path = temp_wav_file.name

    #         # Use audioread to open the audio file
    #         with audioread.audio_open(input_path) as input_audio:
    #             # Initialize a buffer for writing samples
    #             with sf.SoundFile(wav_file_path, mode='w', samplerate=input_audio.samplerate, channels=input_audio.channels, format='WAV', subtype='PCM_16') as wav_file:
    #                 for buffer in input_audio:
    #                     # Convert bytes to numpy array (float32) and write to WAV file
    #                     audio_data = np.frombuffer(buffer, dtype=np.int16)  # Assuming PCM 16-bit data
    #                     wav_file.write(audio_data)


    #         # Use the WAV file with the OpenAI API
    #         with open(wav_file_path, 'rb') as wav_file:

    #             # Use the WAV buffer with OpenAI API
    #             transcription = client.audio.transcriptions.create(
    #             model="whisper-1", 
    #             file=wav_file, 
    #             response_format="text"
    #             )

    #             # Delete the temporary MP3 file
    #             os.remove(wav_file_path)


    #         # Return the transcribed text as JSON
    #         return JsonResponse({'text': transcription})
    #     except Exception as e:
    #         import traceback
    #         traceback.print_exc()
    #         return JsonResponse({'error': 'OpenAI API error', 'details': str(e)}, status=500)
    # else:
    #     return JsonResponse({'error': 'No audio file provided'}, status=400)

    return JsonResponse({'text': 'This is a sample response'})  # Todo: Remove this line and uncomment the above line


# Import necessary modules
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Hospital  # Assuming you have a Hospital model


@csrf_exempt
def fetch_and_store_hospitals(request):
    if request.method == 'POST':
        try:
            # Parse the request body to get location data
            data = json.loads(request.body)
            location = data.get('location', '')

            # Use SERP API to fetch hospital data
            params = {
                "engine": "google_maps",
                "q": "hospitals",
                "address": location,
                "api_key": os.environ['SERP_API_KEY']
            }
            response = requests.get("https://serpapi.com/search", params=params)
            results = response.json()

            # Check if the response contains hospital data
            if 'local_results' in results:
                hospitals = results['local_results']
                # Iterate over the hospital data and save it to the database
                for hospital in hospitals:
                    reviews_link = hospital.get('reviews_link', '')
                    gps_coordinates = hospital.get('gps_coordinates', {})
                    rating = hospital.get('rating', 0)
                    reviews = hospital.get('reviews', 0)
                    hospital_type = hospital.get('type', '')
                    is_open = hospital.get('open_state', '')
                    hours = hospital.get('hours', '')
                    operating_hours = hospital.get('operating_hours', {})
                    phone = hospital.get('phone', '')
                    website = hospital.get('website', '')
                    user_review = hospital.get('user_review', '')
                    thumbnail = hospital.get('thumbnail', '')
                    distance = hospital.get('distance', 0)


                    staff_behavior = get_staff_behavior(hospital)
                    treatment_score = get_treatment_score(hospital)
                    

                    Hospital.objects.create(
                        name=hospital.get('title'),
                        address=hospital.get('address'),
                        longitude=hospital.get('gps_coordinates', {}).get('longitude'),
                        latitude=hospital.get('gps_coordinates', {}).get('latitude'),
                        gps_coordinates=gps_coordinates,
                        rating=rating,
                        reviews=reviews,
                        reviews_link=reviews_link,
                        hospital_type=hospital_type,
                        is_open=True if 'open' in is_open.lower() else False,
                        comfort=hospital.get('comfort', 0),
                        hours=hours,
                        operating_hours=operating_hours,
                        phone=phone,
                        website=website,
                        user_review=user_review,
                        thumbnail=thumbnail,
                        distance=distance,

                        staff_behavior= staff_behavior,
                        treatment_score=treatment_score,
                    )

                return JsonResponse({'status': 'success', 'message': 'Hospitals data stored successfully.'})
            else:
                return JsonResponse({'status': 'error', 'message': 'No hospital data found.'}, status=404)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)