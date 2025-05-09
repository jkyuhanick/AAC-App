AAC App - Augmentative and Alternative Communication (AAC) Web App

Check it out here: https://aac-app-1.onrender.com 

The AAC App is designed to provide individuals with communication needs a platform to express themselves. It leverages the power of the MERN stack (MongoDB, Express, React, Node.js), AWS Polly for text-to-speech functionality, and AWS S3 for storage. The app is designed for seamless interaction, allowing users to create personalized boards with icons that can be clicked to generate speech.

Features

Personalized User Boards: Users can create and manage their boards with customizable choices and images.
Speech Generation: Icons on boards can be clicked to generate speech using AWS Polly, providing real-time communication.
Text-to-Speech Integration: AWS Polly is used to speak the words as they are selected, with an option to read the entire speech box.
Fully Responsive: The app is designed for accessibility, offering a responsive experience across devices.
Customizable Icons & Phrases: Users can add custom icons and phrases to their boards for personalized communication.
Clear Speech Box: The speech box can be cleared with a button after use, allowing for fresh communication each time.
Technologies

Frontend: React.js, CSS, Font Awesome
Backend: Node.js, Express.js, MongoDB
Text-to-Speech: AWS Polly
Storage: AWS S3
Deployment: Hosted on Render (both backend and frontend)
Authentication: Sessions-based login with JWT tokens for secure authentication
Other Libraries/Tools: Axios (for API calls), jQuery (for interactivity)
Explore the App

You can explore the app directly at the following deployed link:
https://aac-app-1.onrender.com 

Note: The first time you visit the site, it may take a minute to load due to the initial server spin-up time on Render’s free-tier instance.

How It Works

User Boards: After logging in, users can create boards with custom icons and phrases. The icons are linked to speech functionality, enabling real-time communication.
Text-to-Speech: Users can click on icons to generate speech, which is powered by AWS Polly.
Speech Box Clearing: The speech box can be cleared with a single click, providing a fresh start for new communication.
