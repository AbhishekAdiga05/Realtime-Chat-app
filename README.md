# ChatVerse

A modern fullstack chat application with real-time messaging, authentication, and media support.

## Features

🌟 Tech stack: MERN + Socket.io + TailwindCSS + Daisy UI
🎃 Authentication && Authorization with JWT
👾 Real-time messaging with Socket.io
🚀 Online user status
👌 Global state management with Zustand
🐞 Error handling both on the server and on the client

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
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development
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
