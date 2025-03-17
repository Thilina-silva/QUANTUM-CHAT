# AI Chat Platform

A simple, static website that allows users to interact with Cohere through a clean and intuitive interface.

## Features

- Real-time chat interface with ChatGPT
- Mobile-responsive design
- Session-based conversation history
- Secure API key management
- No database required

## Setup

1. Clone this repository
2. Create a `.env` file in the root directory and add your Cohere API key:
   ```
   Cohere_API_KEY=your_api_key_here
   ```
3. Open `index.html` in your browser

## Security Note

The API key is managed securely through environment variables and should never be exposed in the frontend code.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Cohere API 