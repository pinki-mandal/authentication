# Authentication Backend + Tailwind Frontend

This project combines a Node.js/Express authentication backend with a React + Tailwind frontend.

## Features
- User registration with OTP verification
- Email/password authentication
- Email OTP login
- Phone OTP login
- JWT authentication
- Refresh token flow
- Forgot password reset
- Resend OTP
- Password hashing with bcrypt
- Rate limiting and input validation

## Project Structure
- Backend: src/
- Frontend: my-project/

## Setup
1. Install dependencies:
   - Backend: npm install
   - Frontend: cd my-project && npm install
2. Copy .env.example to .env and update values.
3. Start the backend:
   - npm run dev
4. Start the frontend:
   - cd my-project && npm run dev

## API Base URL
The frontend uses /api by default through Vite proxy, so it will call the backend on port 5000.

## Notes
- OTPs are logged to the console in development mode when email credentials are not configured.
- A local MongoDB instance is expected unless MONGO_URI is provided.
