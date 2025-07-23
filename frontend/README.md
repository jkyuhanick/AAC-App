AAC (Augmentative and Alternative Communication) App

Overview

The AAC Communication App is an augmentative and alternative communication (AAC) tool designed to assist individuals with speech impairments in facilitating communication. Built with accessibility in mind, the interface is intentionally simple and intuitive to ensure ease of use for individuals of all ages and abilities.

This app is built using the MERN stack (MongoDB, Express, React, Node.js) and integrates AWS Polly for text-to-speech functionality and AWS S3 for image storage.

Features

✅ Simple & Accessible UI – Designed with a minimalistic interface to improve usability for individuals with disabilities.
✅ Text-to-Speech Integration – Uses AWS Polly to convert selected words and phrases into speech.
✅ Customizable Boards & Choices – Users can select and customize communication boards tailored to their needs.
✅ Image Storage with AWS S3 – Stores user-uploaded images to enhance communication flexibility.
✅ MongoDB Database – Efficiently stores user data, preferences, and board configurations.
✅ Responsive Design – Works across various devices, ensuring accessibility on desktops, tablets, and mobile devices.


Tech Stack

Front-End: React, Vite, CSS
Back-End: Node.js, Express
Database: MongoDB
Cloud Services: AWS Polly (text-to-speech), AWS S3 (image storage)


Setup & Installation

Prerequisites
Ensure you have the following installed:
Node.js

Installation Steps
Clone the repository:
git clone https://github.com/jkyuhanick/aac-app.git
cd aac-app

Install dependencies:
npm install

Set up environment variables:
Create a .env file in the root directory.
Add necessary AWS credentials and MongoDB connection string.
Run the development server:
npm run dev
Access the app at http://localhost:5173/.
Future Enhancements

🔹 User Authentication – Implement secure login for personalized settings.
🔹 Board Sharing & Exporting – Allow users to share their configurations.
🔹 Offline Mode – Enable usage without an internet connection.

