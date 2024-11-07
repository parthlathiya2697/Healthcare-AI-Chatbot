import os
import io
import requests
import soundfile as sf
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter


def get_staff_behavior(hospital):
    # Your logic to extract staff behavior score
    return 1


def get_treatment_score(hospital):
    # Your logic to extract treatment score
    return 1


def create_vector_store():
    # Create a vector store on server startup
    pdf_folder = "./backend/health_dataset"  # Replace with your actual PDF folder path
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
    return vector_store


def jaccard_similarity(query, document):
    query = query.lower().split(" ")
    document = document.lower().split(" ")
    intersection = set(query).intersection(set(document))
    union = set(query).union(set(document))
    return len(intersection) / len(union)


def return_response(query, corpus):
    similarities = [jaccard_similarity(query, doc) for doc in corpus]
    return corpus[similarities.index(max(similarities))]


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


def extract_doctor_info(text) : 

    print(f'\nextract_doctor_info')

    genai.configure(api_key='AIzaSyASEjuFeJICbV8E6LRhMgxzkNMwYkpfm7Y')
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
                Please provide your response below (output in list of JSON like [dict <doctor info>, dict >doctor2 info> ,...]. Do not inlude markup language in the response):
                Needed info: name, specialty, rating, availability(dict of hours like [6,7,8,9]), phone_number
                Input: {text}
                """
    response = model.generate_content(prompt)
    response = response.text.replace("```json","").replace("```","").strip()
    response = json.loads(response)
    return response


def fetch_doctors(hospital_name, location):

    print(f'\nfetch_doctors')

    # from serpapi import GoogleSearch
    query = f"{hospital_name} doctors {location}"

    # First, perform a search to get a list of doctors
    params = {
        "engine": "google",
        "q": query,
        "api_key": os.environ['SERP_API_KEY'],
        "type": "search",
    }

    # Use requests to get the results
    print(f'Doing google serp')
    response = requests.get("https://serpapi.com/search", params=params)
    results = response.json()
    # with open(f'results_{query}.json', 'w') as f:
    #     json.dump(results, f)
    # with open("results_Intermountain Medical Center doctors surat.json") as f:
    #     results = json.load(f)
    
    doctors = []

    if 'organic_results' in results:
        organic_results = results['organic_results']
        parsed_organic_results = [ 
                {
                    'title' : result.get('title', ''),
                    'snippet' : result.get('snippet', ''),
                }
                for result in organic_results
            ]
        doctors_info_list = extract_doctor_info(str(parsed_organic_results))
        for doctors_info in doctors_info_list:
            doctor = {}
            doctor['name'] = doctors_info.get('name', '') if doctors_info.get('name', '') else ''
            doctor['specialty'] = doctors_info.get('specialty', '') if doctors_info.get('specialty', '') else ''
            doctor['rating'] = float(doctors_info.get('rating', 0.0)) if doctors_info.get('rating', 0.0) else 0.0
            doctor['availability'] = doctors_info.get('availability', {}) if doctors_info.get('availability', {}) else {}
            doctor['phone'] = doctors_info.get('phone_number', '') if doctors_info.get('phone_number', '') else ''

            # Analyze reviews for sentiment, behavior, and expertise
            reviews = doctors_info.get('reviews', [])
            sentiments = []
            behavior_scores = []
            expertise_scores = []

            for review in reviews:
                text = review.get('snippet', '')
                rating = review.get('rating', 0)

                # Placeholder sentiment analysis based on rating
                if rating >= 4:
                    sentiments.append(1)
                elif rating <= 2:
                    sentiments.append(-1)
                else:
                    sentiments.append(0)

                # Placeholder for behavior and expertise scores
                behavior_scores.append(rating)
                expertise_scores.append(rating)

            if sentiments:
                avg_sentiment = sum(sentiments) / len(sentiments)
                doctor['feedback_sentiment'] = (
                    'positive' if avg_sentiment > 0 else 'negative' if avg_sentiment < 0 else 'neutral'
                )
                doctor['behavior'] = sum(behavior_scores) / len(behavior_scores)
                doctor['expertise'] = sum(expertise_scores) / len(expertise_scores)
            else:
                doctor['feedback_sentiment'] = ''
                doctor['behavior'] = 0.0
                doctor['expertise'] = 0.0

            doctors.append(doctor)

    return doctors
