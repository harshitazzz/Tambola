# Tambola 

A modern, highly-interactive, and aesthetically pleasing full-stack digital version of the classic Indian bingo game, Tambola.

This repository houses a unified platform featuring a **React + Frontend** and a strongly-typed **Node.js/Express Backend** utilizing Object-Oriented patterns to manage real-time game flows.

---

## Architecture & Design Patterns

The Tambola backend is built using strict TypeScript and robust **Object-Oriented Programming (OOP) Design Patterns** to ensure state isolation, clean routing, and scalability.

### 1. The Singleton Pattern
State management across the server relies heavily on the `RoomManager` class, designed purely as a **Singleton**.
- **Why?** Since rooms must be accessible globally regardless of the API route being hit, restricting `RoomManager` to a single instantiated instance prevents data duplication or lost states. The entire application queries `RoomManager.getInstance()`.

### 2. Information Hiding & Encapsulation
The `Room` class serves as the core entity protecting state details (e.g., players list, game rules, game status). 
- Variables like `code`, `players`, and `settings` are strictly `private`. 
- State modification only occurs via public setter interfaces like `addPlayer(...)` or `startGame()`, ensuring no corrupted data is inadvertently pushed into a room.

### 3. Controller-Service Decoupling
An architectural separation occurs between network layers and business logic.
- **`RoomController`**: Handles solely Express HTTP logic (parsing `req`, returning `res.json`).
- **`RoomManager`** (Service): Handles actual data interactions.

---

## 🚀 Application Walkthrough (User Flow)

The application handles a completely synchronous multi-user flow entirely over automated polling. Here is a walkthrough of how the product functions:

### 🌟 Step 1: Host Creates a Room
1. The **Host** accesses the landing page, characterized by lush Tambola Green formatting and dropping Framer Motion physics.
2. The Host clicks **Create Room**. They enter their nickname and configure the game settings (e.g., Auto/Manual calling, points, and specific Tambola rules like First 5 or Full House).
3. The system generates a unique 6-character room code and a sharable URL linking directly to the room.

### 🤝 Step 2: Guests Join the Room
1. The **Guest** clicks the shareable link (e.g., `/join/ABCD12`).
2. The Guest is instantly directed to a modal prompting for their nickname (bypassing the manual code-entry step).
3. Upon entering a nickname, the Guest is moved to the **Waiting Room**.

### ⏳ Step 3: The Waiting Room & Synchronization
1. The Guest's UI renders a read-only, beautifully styled badge of the game's Active Rules and Settings, ensuring players are aware of the stakes before the game starts.
2. Both Host and Guest interfaces display a live, updating list of participants in the room.

### 🎮 Step 4: Starting the Game
1. The Host interface enables the **Start Game** button once participants exist.
2. When the Host clicks start, the backend `status` is updated to `'started'`.
3. The automated polling running on the Guest's client detects the state change, immediately and synchronously routing both the Host and all Guests to the active **Game Screen**.

---

## 🛠 Tech Stack

- **Frontend:** React JS, Vite, TypeScript
- **Styling:** Vanilla CSS, Framer Motion (Animations), ThreeJS (3D Backgrounds)
- **Backend:** Node.js, Express.js, TypeScript

---

## 💻 How to Run Locally

You must run both the backend API and frontend servers concurrently.

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```
*(Runs securely on `http://localhost:3000`)*

**2. Start the Frontend:**
```bash
cd website
npm install
npm run dev
```
*(Runs on `http://localhost:5173` — Open this in your browser)*

**Testing Tip:** To simulate a real game, open `http://localhost:5173` in your normal browser to host a game, copy the join link, and open it in an **Incognito Window** to join as a guest!
