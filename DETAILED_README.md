# ChatVerse – Full Project Revision & Code Logic

## 1. Overview

A fullstack chat app with authentication, real-time messaging, media uploads, and a modern React UI. Built for learning and extensibility.

---

## 2. Folder Structure & Key Files

```
chat-app/
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js              # Express server entry
│       ├── controllers/         # Route logic (auth, message)
│       ├── lib/                 # DB, cloudinary, socket, utils
│       ├── middleware/          # Auth middleware
│       ├── models/              # Mongoose schemas (User, Message)
│       ├── routes/              # API endpoints
│       └── seeds/               # Seed scripts
└── frontend/
    ├── package.json
    ├── src/
        ├── App.jsx, main.jsx    # App entry
        ├── components/         # UI (Chat, Sidebar, etc.)
        ├── constants/          # Static values
        ├── lib/                # Axios, utils
        ├── pages/              # Route pages
        └── store/              # Zustand stores
```

---

## 3. Backend Logic

### Express Server (`src/index.js`)

- Loads env vars, connects MongoDB, mounts `/api/auth` and other routes.
- Uses ES Modules, dotenv, and nodemon for dev.

### Auth Flow

- **Signup**: Receives user data, hashes password (bcryptjs), saves user, returns JWT.
- **Login**: Validates credentials, issues JWT, sets cookie.
- **Logout**: Clears auth cookie.
- **Middleware**: JWT verification for protected routes.

### Models

- **User**: email (unique), fullName, password (hashed), profilePic, timestamps.
- **Message**: sender, receiver, content, timestamps (see `models/message.model.js`).

### Real-Time Messaging

- **Socket.io**: Handles user connections, emits/receives messages, broadcasts to rooms.

### Media Uploads

- **Cloudinary**: Used for profile pictures and message attachments (see `lib/cloudinary.js`).

---

## 4. Frontend Logic

### React + Vite

- **Entry**: `main.jsx` renders `<App />`.
- **Routing**: Page components for Home, Login, Signup, Profile, Settings.
- **State**: Zustand stores for auth, chat, theme.
- **API**: Axios instance in `lib/axios.js` for backend calls.
- **Components**: Modular UI (ChatContainer, Sidebar, MessageInput, etc.), skeleton loaders for UX.
- **Auth**: Login/Signup forms, JWT stored in cookies, protected routes.
- **Chat**: Real-time updates via Socket.io client, message list, input, and header.

---

## 5. Important Features & Code Logic

### Backend Features

#### 1. **Authentication (Signup, Login, Logout, JWT, Middleware)**

- **Signup**: Validates input, hashes password with bcrypt, checks for duplicate email, saves user, generates JWT, sets cookie.
  ```js
  // src/controllers/auth.controller.js (signup)
  export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    // ...validation...
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ fullName, email, password: hashedPassword });
    generateToken(newUser._id, res); // sets JWT cookie
    await newUser.save();
    res
      .status(201)
      .json({
        _id: newUser._id,
        fullName,
        email,
        profilePic: newUser.profilePic,
      });
  };
  ```
- **Login**: Finds user, compares password, issues JWT cookie.
  ```js
  // src/controllers/auth.controller.js (login)
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });
  generateToken(user._id, res);
  res.status(200).json({ _id: user._id, fullName: user.fullName, ... });
  ```
- **Logout**: Clears JWT cookie.
- **JWT Middleware**: Checks for JWT in cookies, verifies, attaches user to req.
  ```js
  // src/middleware/auth.middleware.js
  export const protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  };
  ```

#### 2. **Profile Management (Cloudinary Upload)**

- Accepts base64 image, uploads to Cloudinary, updates user profilePic.
  ```js
  // src/controllers/auth.controller.js (updateProfile)
  const uploadResponse = await cloudinary.uploader.upload(profilePic);
  await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true },
  );
  ```

#### 3. **Messaging (CRUD, Real-Time, Media)**

- **Send Message**: Accepts text/image, uploads image if present, saves message, emits via Socket.io to receiver.
  ```js
  // src/controllers/message.controller.js (sendMessage)
  if (image) {
    imageUrl = await cloudinary.uploader.upload(image).secure_url;
  }
  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });
  await newMessage.save();
  if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
  res.status(201).json(newMessage);
  ```
- **Get Messages**: Fetches all messages between two users.
- **Get Users**: Returns all users except current for sidebar.

#### 4. **Socket.io Integration**

- Tracks online users, emits online status, delivers real-time messages.
  ```js
  // src/lib/socket.js
  io.on("connection", (socket) => {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => { delete userSocketMap[userId]; ... });
  });
  ```

#### 5. **Database Models**

- **User**: fullName, email, password (hashed), profilePic, timestamps.
- **Message**: senderId, receiverId, text, image, timestamps.

---

### Frontend Features

#### 1. **Authentication (Signup, Login, Logout, Auth Check)**

- **Signup/Login**: Forms validate input, call backend, store user in Zustand, connect socket, show toasts.
  ```js
  // src/store/useAuthStore.js
  signup: async (data) => { ... set({ authUser: res.data }); get().connectSocket(); ... }
  login: async (data) => { ... set({ authUser: res.data }); get().connectSocket(); ... }
  logout: async () => { ... set({ authUser: null }); get().disconnectSocket(); ... }
  ```
- **Auth Check**: On app load, checks `/auth/check`, restores session.

#### 2. **Profile Management**

- **ProfilePage**: Lets user upload new avatar (base64), preview, and apply (calls backend, updates Zustand store).
  ```js
  // src/pages/ProfilePage.jsx
  const handleApply = async () => {
    await updateProfile({ profilePic: previewImg });
  };
  ```

#### 3. **Messaging (Send/Receive, Media, Real-Time)**

- **Send Message**: MessageInput lets user send text or image (base64), calls backend, updates chat store.
  ```js
  // src/components/MessageInput.jsx
  await sendMessage({ text: text.trim(), image: imagePreview });
  ```
- **Receive Message**: useChatStore subscribes to "newMessage" via socket, appends to messages if from selected user.
  ```js
  // src/store/useChatStore.js
  socket.on("newMessage", (newMessage) => { ... set({ messages: [...get().messages, newMessage] }); });
  ```
- **Sidebar**: Lists users, shows online status, allows selecting chat.
- **ChatContainer**: Shows messages, images, sender avatars, auto-scrolls.

#### 4. **State Management (Zustand)**

- **useAuthStore**: Handles auth state, user, socket, online users.
- **useChatStore**: Handles messages, users, selected user, loading states, message sending/receiving.
- **useThemeStore**: Persists theme in localStorage, updates UI.

#### 5. **UI/UX Features**

- **Theme Switching**: SettingsPage lets user pick from 30+ themes, preview chat UI.
- **Skeleton Loaders**: Show loading skeletons for sidebar and messages.
- **Toasts**: react-hot-toast for feedback on actions/errors.
- **Responsive Design**: Mobile-friendly layouts, adaptive components.

#### 6. **Error Handling**

- All async actions wrapped in try/catch, errors shown via toast.

---

## 6. Code Snippets & Logic

---

## 6. Code Snippets & Logic

### Example: Protecting a Route (Backend)

```js
// src/middleware/auth.middleware.js
export const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId).select("-password");
  next();
};
```

### Example: Real-Time Message Delivery (Backend)

```js
// src/controllers/message.controller.js
const receiverSocketId = getReceiverSocketId(receiverId);
if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
```

### Example: Zustand Chat Store (Frontend)

```js
// src/store/useChatStore.js
export const useChatStore = create((set, get) => ({
  messages: [],
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      messageData,
    );
    set({ messages: [...messages, res.data] });
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      set({ messages: [...get().messages, newMessage] });
    });
  },
  // ...
}));
```

### Example: Theme Store (Frontend)

```js
// src/store/useThemeStore.js
export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
```

---

## 7. Environment & Scripts

- **Backend**: `.env` for PORT, MONGODB_URI, JWT_SECRET
- **Frontend**: Vite config, public assets
- **Scripts**: `npm start` (backend), `npm run dev` (frontend)

---

## 8. Next Steps / TODO

- Implement full message CRUD
- Add group chat support
- Enhance error handling & validation
- Add tests (Jest, React Testing Library)
- Deploy (Render, Vercel, etc.)

---

## 9. References

- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Socket.io Docs](https://socket.io/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

_Compiled: February 24, 2026_
