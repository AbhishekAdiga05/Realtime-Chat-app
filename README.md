# ChatVerse

A production-ready fullstack chat application built with the MERN stack, featuring real-time messaging, JWT authentication, and media uploads.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **Real-time**: Socket.io
- **Media Storage**: Cloudinary
- **Validation**: Zod

### Frontend
- **Framework**: React 19 with Vite
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: TailwindCSS + Daisy UI
- **Real-time**: Socket.io-client
- **Routing**: React Router v7

## Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, env, Cloudinary config
│   │   ├── controllers/   # Route handlers (auth, chat, user)
│   │   ├── middleware/    # Auth guard, error handler, validation
│   │   ├── models/        # Mongoose schemas (User, Conversation, Message)
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic (chat, upload)
│   │   ├── socket/        # Socket.io event handlers
│   │   ├── utils/         # Helpers (tokens, responses)
│   │   └── index.js       # App entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance + interceptors
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Helpers
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
└── package.json           # Root workspace (optional)
```

## Getting Started

### 1. Clone & Install

```bash
# Install root dependencies (if using workspace)
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Environment Configuration

Create `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatverse

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend (port 5001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns tokens) |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/refresh` | Refresh access token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Search users by query |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users` | Update profile (auth required) |
| PUT | `/api/users/avatar` | Upload avatar |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List user's conversations |
| POST | `/api/conversations` | Create/start conversation |
| GET | `/api/conversations/:id` | Get conversation by ID |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:conversationId` | Paginated messages |
| POST | `/api/messages` | Send message (text/media) |

## Socket Events

### Client → Server
- `join` – Join user's personal room
- `send-message` – Send real-time message

### Server → Client
- `new-message` – Broadcast incoming message
- `user-online` – User came online
- `user-offline` – User went offline

## Key Features

- **Real-time messaging** via Socket.io with typing indicators
- **JWT authentication** with secure httpOnly cookies
- **Online presence** system with live status updates
- **Media uploads** (images, files) via Cloudinary
- **Responsive UI** built with TailwindCSS + Daisy UI
- **Global state** management with Zustand stores
- **Error handling** – Server validation + client error boundaries

## Scripts

### Backend
```bash
npm run dev     # Start with nodemon (development)
npm start       # Start production server
npm run lint    # ESLint check
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint check
```

## Architecture Notes

### Backend Flow
1. Request hits Express router
2. Middleware validates JWT (protected routes)
3. Controller processes request, calls service
4. Service interacts with Mongoose models
5. Response sent with standardized format

### Frontend Flow
1. Zustand stores manage global state (auth, chat, ui)
2. Axios interceptor adds auth tokens to requests
3. Socket.io maintains persistent connection
4. Components subscribe to store changes

## License

MIT