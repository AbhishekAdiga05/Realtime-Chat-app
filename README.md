# ChatVerse

A modern fullstack chat application with real-time messaging, authentication, and media support.

## Features

- User authentication (signup, login, logout)
- Real-time chat with Socket.io
- Profile picture upload (Cloudinary)
- Responsive React frontend (Vite)
- MongoDB database (Mongoose ODM)

## Project Structure

```
chat-app/
├── backend/      # Node.js/Express API
└── frontend/     # React + Vite client
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env # Create and edit your .env
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables (Backend)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_jwt_secret_here
```

## Scripts

- `npm start` (backend): Start API server (nodemon)
- `npm run dev` (frontend): Start React dev server

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.io
- Frontend: React 19, Vite, Axios, Zustand
- Media: Cloudinary

## Folder Highlights

- `backend/src/controllers/` – API logic
- `backend/src/models/` – Mongoose schemas
- `frontend/src/components/` – UI components
- `frontend/src/store/` – Zustand state management

## License

MIT
