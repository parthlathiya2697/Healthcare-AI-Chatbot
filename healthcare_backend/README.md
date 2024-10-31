## Healthcare Backend

This repository contains the backend for a healthcare application. It is built using Django and provides APIs for interacting with healthcare data.

### Getting Started

1. **Clone the repository:**

2. **Create a virtual environment:**
```bash
python3 -m venv venv
```

3. **Activate the virtual environment:**
```bash
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Set up environment variables:**
   - Create a `.env` file in the project root directory.
   - Add the following environment variables:
     ```
     OPENAI_API_KEY=your_openai_api_key
     SERP_API_KEY=your_serp_api_key
     ```

6. **Run database migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Start the development server:**
```bash
python manage.py runserver
```


The server will be running at `http://localhost:8000/`.

### Database Models

The backend uses the following database models:

- **Hospital:**
  - `name`: Name of the hospital
  - `address`: Address of the hospital
  - `longitude`: Longitude of the hospital
  - `latitude`: Latitude of the hospital
  - `gps_coordinates`: GPS coordinates of the hospital
  - `rating`: Rating of the hospital
  - `reviews`: Number of reviews for the hospital
  - `reviews_link`: Link to the reviews for the hospital
  - `hospital_type`: Type of the hospital
  - `is_open`: Whether the hospital is open
  - `comfort`: Comfort rating of the hospital
  - `hours`: Operating hours of the hospital
  - `operating_hours`: Operating hours of the hospital
  - `phone`: Phone number of the hospital
  - `website`: Website of the hospital
  - `user_review`: User review of the hospital
  - `thumbnail`: Thumbnail image of the hospital
  - `staff_behavior`: Staff behavior rating of the hospital
  - `treatment_score`: Treatment score of the hospital
  - `distance`: Distance from the user's location

- **Doctor:**
  - `name`: Name of the doctor
  - `specialty`: Specialty of the doctor
  - `rating`: Rating of the doctor
  - `availability`: Availability of the doctor
  - `behavior`: Behavior rating of the doctor
  - `expertise`: Expertise rating of the doctor
  - `feedback_sentiment`: Sentiment of the feedback for the doctor
  - `phone`: Phone number of the doctor

### APIs

The backend provides the following APIs:

- **`/api/chat_openai/`:**  Chat with an OpenAI model.
- **`/api/chat_gemini/`:** Chat with a Gemini model.
- **`/api/first_aid_suggestions_openai/`:** Get first aid suggestions from an OpenAI model.
- **`/api/hospitals_suggestions_openai/`:** Get hospital suggestions from an OpenAI model.
- **`/api/doctors_suggestions_openai/`:** Get doctor suggestions from an OpenAI model.
- **`/api/hospitals/`:** Get a list of hospitals.
- **`/api/doctors/`:** Get a list of doctors.
- **`/api/translate_audio/`:** Translate audio to text.
- **`/api/fetch_and_store_hospitals/`:** Fetch and store hospital data from SERP API.

### Usage

The APIs can be accessed using any HTTP client, such as Postman or curl.

**Example:**
curl -X POST -H "Content-Type: application/json" -d '{"query": "What is the best hospital in New York City?"}' http://localhost:8000/api/hospitals_suggestions_openai/


