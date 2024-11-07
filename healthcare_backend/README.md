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

### Project Flow

The healthcare application is designed to provide users with a comprehensive platform to manage and inquire about their health-related concerns. Here's how the different sections of the application work:

- **Main Chat Section:**
  - Users can chat about their health problems.
  - As users chat, the application provides real-time responses and suggestions.

- **First Aid Section:**
  - This section updates itself based on the user's chat in the main section.
  - It provides immediate first aid advice and tips relevant to the user's health concerns.

- **Hospitals Section:**
  - Displays nearby hospitals based on the user's location.
  - Users can inquire about hospital facilities, services, and more.

- **Doctors Section:**
  - Contains a list of doctors from the displayed hospitals.
  - Users can chat about available doctors, their specialties, and working experience.
  - The section also provides insights into which hospitals have the most success rates by analyzing hospital data with AI.

Each section is designed to facilitate user interaction and provide valuable health-related information, leveraging AI to enhance the user experience.
