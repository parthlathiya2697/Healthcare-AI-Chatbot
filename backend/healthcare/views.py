import os
import json
import logging

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.paginator import Paginator
from django.db.models import Q, F, FloatField
from django.db.models.functions import Sqrt
from rest_framework import status
from openai import OpenAI
import google.generativeai as genai
from .models import Hospital, Doctor
from healthcare_backend import settings
from backend.healthcare.utils import create_vector_store, convert_to_wav, fetch_doctors

# Custom imports
from .openai_api import chat_openai_
from .gemini_api import chat_gemini_



logger = logging.getLogger(__name__)


# Call the function to create the vector store on server startup
vector_store = create_vector_store()
    

@csrf_exempt
def hospital_list(request):
    try:
        data = json.loads(request.body)
        user_longitude = data.get('longitude', None)
        user_latitude = data.get('latitude', None)

        if user_longitude is None or user_latitude is None:
            return JsonResponse({'error': 'User location not provided'}, status=400)

        # Calculate the approximate distance using the Pythagorean theorem
        hospitals = Hospital.objects.annotate(
            proximity=Sqrt(
                (F('longitude') - user_longitude) ** 2 + (F('latitude') - user_latitude) ** 2,
                output_field=FloatField()
            )
        ).order_by('proximity')

        paginator = Paginator(hospitals, 10)  # Show 10 hospitals per page
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        hospitals_data = list(page_obj.object_list.values())
        return JsonResponse({
            'hospitals': hospitals_data,
            'page': page_obj.number,
            'total_pages': paginator.num_pages
        }, safe=False)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
def doctor_list(request):
    # Parse JSON body data
    try:
        data = json.loads(request.body)
        hospital_names = data.get('hospital_names', [])
        hospital_locations = data.get('hospital_locations', [])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Filter doctors based on hospital names and locations
    query = Q()
    for name, location in zip(hospital_names, hospital_locations):
        query |= Q(hospital_name=name)

    doctors = Doctor.objects.filter(query)
    paginator = Paginator(doctors, 10)  # Show 10 doctors per page

    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    doctors_data = list(page_obj.object_list.values())
    return JsonResponse({
        'doctors': doctors_data,
        'page': page_obj.number,
        'total_pages': paginator.num_pages
    }, safe=False)


@csrf_exempt
def chat_openai(request):

    response = chat_openai_(request, vector_store)

    # Return the response as JSON
    return JsonResponse({'response': response})


    

@csrf_exempt
def chat_gemini(request):

    response = chat_gemini_(request, vector_store)

    # Return the response as JSON
    return JsonResponse({'response': response})

@csrf_exempt
def first_aid_suggestions_openai(request):

    if settings.request_count >= settings.request_count_max:
        return JsonResponse({'error': 'Request limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    

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

    # increease the request count
    settings.request_count += 1

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})


@csrf_exempt
def hospitals_suggestions_openai(request):

    if settings.request_count >= settings.request_count_max:
            return JsonResponse({'error': 'Request limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    

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

     # increease the request count
    settings.request_count += 1

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})


@csrf_exempt
def doctors_suggestions_openai(request):

    if settings.request_count >= settings.request_count_max:
            return JsonResponse({'error': 'Request limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    

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

    # increease the request count
    settings.request_count += 1

    # Return the response as JSON
    return JsonResponse({'suggestion': response_message})




@csrf_exempt
def fetch_and_store_hospitals(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '')
            reference_content = data.get('reference_content', '')
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

            if 'local_results' in results:
                hospitals = results['local_results']
                for hospital in hospitals:
                    Hospital.objects.create(
                        name=hospital.get('title', ''),
                        address=hospital.get('address', ''),
                        longitude=hospital.get('gps_coordinates', {}).get('longitude', 0.0),
                        latitude=hospital.get('gps_coordinates', {}).get('latitude', 0.0),
                        gps_coordinates=hospital.get('gps_coordinates', {}),
                        rating=hospital.get('rating', 0.0),
                        reviews=hospital.get('reviews', 0),
                        reviews_link=hospital.get('reviews_link', ''),
                        hospital_type=hospital.get('type', 'General'),
                        is_open=hospital.get('is_open', False),
                        comfort=hospital.get('comfort', 0.0),
                        hours=hospital.get('hours', ''),
                        operating_hours=hospital.get('operating_hours', {}),
                        phone=hospital.get('phone', ''),
                        website=hospital.get('website', ''),
                        user_review=hospital.get('user_review', ''),
                        thumbnail=hospital.get('thumbnail', ''),
                        staff_behavior=hospital.get('staff_behavior', 0.0),
                        treatment_score=hospital.get('treatment_score', 0.0),
                        distance=hospital.get('distance', 0.0),
                        women_friendly=hospital.get('women_friendly', False)
                    )

                    # Get hospital website link
                    website = hospital.get('website', '')
                        
                    # Crawl all pages from robots.txt file and save in json structure
                    if website:
                        _list = fetch_doctors(hospital.get('title'), location)

                        # Store the doctors data in the database
                        for doctor in _list:
                            Doctor.objects.create(
                                name=doctor.get('name'),
                                specialty=doctor.get('specialty'),
                                rating=doctor.get('rating'),
                                availability=doctor.get('availability'),
                                behavior=doctor.get('behavior'),
                                expertise=doctor.get('expertise'),
                                feedback_sentiment=doctor.get('feedback_sentiment'),
                                phone=doctor.get('phone'),
                                hospital_longitude = hospital.get('gps_coordinates', {}).get('longitude'),
                                hospital_latitude = hospital.get('gps_coordinates', {}).get('latitude'),
                                hospital_name = hospital.get('title'),
                                hospital_website = website,
                                women_friendly = 0 # Todo: add logic here 
                            )
                return JsonResponse({'status': 'success', 'message': 'Hospitals data stored successfully.'})
            else:
                return JsonResponse({'status': 'error', 'message': 'No hospital data found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)





@require_POST
@csrf_exempt
def translate_audio(request):
    audio_file = request.FILES.get('audio_file')

    if audio_file:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        try:
            # Check if the file is in-memory or a temporary file
            if hasattr(audio_file, 'temporary_file_path'):
                # File is stored as a temporary file
                input_path = audio_file.temporary_file_path()
            else:
                # File is in-memory, save it to a temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_input_file:
                    # Write the in-memory file content to a temporary file
                    for chunk in audio_file.chunks():
                        temp_input_file.write(chunk)
                    input_path = temp_input_file.name

            # Create a temporary file for the WAV output
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_wav_file:
                wav_file_path = temp_wav_file.name

            # Use audioread to open the audio file
            with audioread.audio_open(input_path) as input_audio:
                # Initialize a buffer for writing samples
                with sf.SoundFile(wav_file_path, mode='w', samplerate=input_audio.samplerate, channels=input_audio.channels, format='WAV', subtype='PCM_16') as wav_file:
                    for buffer in input_audio:
                        # Convert bytes to numpy array (float32) and write to WAV file
                        audio_data = np.frombuffer(buffer, dtype=np.int16)  # Assuming PCM 16-bit data
                        wav_file.write(audio_data)


            # Use the WAV file with the OpenAI API
            with open(wav_file_path, 'rb') as wav_file:

                # Use the WAV buffer with OpenAI API
                transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=wav_file, 
                response_format="text"
                )

                # Delete the temporary MP3 file
                os.remove(wav_file_path)

            # Increment the request count
            settings.request_count += 1

            # Return the transcribed text as JSON
            return JsonResponse({'text': transcription})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'OpenAI API error', 'details': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'No audio file provided'}, status=400)



@csrf_exempt
def request_count_view(request):
    if request.method == 'GET':
        try:
            return JsonResponse({
                'request_count': settings.request_count,
                'max_request_count': settings.request_count_max
            }, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)