## Healthcare Application

This repository contains both the frontend and backend for a healthcare application. The application is designed to provide users with a comprehensive platform to manage and inquire about their health-related concerns.

### Overview

- **Backend:** Built using Django, it provides APIs for interacting with healthcare data.
- **Frontend:** Built using Reactjs/Nextjs, it provides a user interface for interacting with healthcare data and services.

### Features

- **Main Chat Section:**
  - Users can chat about their health problems.
  - Provides real-time responses and suggestions.

- **First Aid Section:**
  - Updates itself based on the user's chat in the main section.
  - Provides immediate first aid advice and tips relevant to the user's health concerns.

- **Hospitals Section:**
  - Displays nearby hospitals based on the user's location.
  - Users can inquire about hospital facilities, services, and more.

- **Doctors Section:**
  - Contains a list of doctors from the displayed hospitals.
  - Users can chat about available doctors, their specialties, and working experience.
  - Provides insights into which hospitals have the most success rates by analyzing hospital data with AI.

### Getting Started

#### Backend

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

#### Frontend

1. **Clone the repository:**

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The application will be running at `http://localhost:3000/`.

### Technologies Used

- **Backend:** Django, OpenAI API, SERP API
- **Frontend:** React, Axios, Material-UI, Lucide-React, React-Markdown

### Note

This AI assistant is for informational purposes only. Always consult with a qualified healthcare professional for medical advice.
