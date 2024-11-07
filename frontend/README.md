## Healthcare Frontend

This repository contains the frontend for a healthcare application. It is built using React and provides a user interface for interacting with healthcare data and services.

### Getting Started

1. **Clone the repository:**

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The application will be running at `http://localhost:3000/`.

### Project Flow

The healthcare application frontend is designed to provide users with an intuitive interface to manage and inquire about their health-related concerns. Here's how the different sections of the application work:

- **Main Chat Section:**
  - Users can chat about their health problems.
  - The application provides real-time responses and suggestions.

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

Each section is designed to facilitate user interaction and provide valuable health-related information, leveraging AI to enhance the user experience.

### Components

- **HealthcareAIChatbot.tsx:** The main component that handles user interactions and displays chat messages, first aid tips, hospital information, and doctor details.
- **AudioDialog, CameraPanel, ImageModal, VideoDialog, VideoModal, MediaModal:** Components for handling media inputs and displaying media content.
- **RequestCountDisplay:** Displays the number of requests made by the user.

### Technologies Used

- **React:** For building the user interface.
- **Axios:** For making HTTP requests to the backend.
- **Material-UI:** For UI components and styling.
- **Lucide-React:** For icons.
- **React-Markdown:** For rendering markdown content.
