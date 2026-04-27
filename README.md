# Tambola

A modern, highly-interactive, and aesthetically pleasing full-stack digital version of the classic Indian bingo game, Tambola.

This repository houses a unified platform featuring a **React + Clean Architecture Frontend** and a strongly-typed **Node.js/Express & Socket.io Backend** utilizing robust Object-Oriented patterns to manage real-time game flows.

---

## 🏗️ Architecture & Design Patterns

The Tambola codebase is built using strict TypeScript and robust **Object-Oriented Programming (OOP) Design Patterns** to ensure state isolation, clean routing, and scalability.

### 1. Clean Architecture (Frontend)
The React frontend completely decouples UI from business logic using Domain-Driven Design:
- **Domain Layer:** Pure TypeScript entities (`Game`, `Player`, `Ticket`).
- **Application Layer:** Use Cases (`GenerateTicketUseCase`, `CallNextNumberUseCase`, etc.) encapsulating game rules.
- **Infrastructure Layer:** Core services like `GameManager` (Singleton), `SocketService`, and `SoundService`.
- **Presentation Layer:** React UI components that observe changes from the `GameManager` state.

### 2. The Singleton Pattern
State management across both the server and client relies heavily on Singleton managers:
- **`RoomManager` (Backend):** Ensures all active game sessions and player connections are centralized, preventing data duplication.
- **`GameManager` (Frontend):** Maintains the single source of truth for the local client's state, updating React via the Observer pattern.

### 3. Real-time Event-Driven Synchronization
The application relies on **Socket.io** WebSockets to handle seamless, bidirectional state syncing:
- Ensures automated caller and manual number calls are immediately reflected on all connected clients.
- Processes realtime marking, claims, and automatic win-condition tracking.
- Effectively handles player disconnections gracefully.

*(For an in-depth dive into the structure, see [architecture.md](./architecture.md))*

---

## 🎮 Application Walkthrough (User Flow)

The application handles a completely synchronous multi-user flow over WebSockets.

### Step 1: Host Creates a Room
1. The **Host** accesses the landing page, characterized by lush Tambola Green formatting and dropping Framer Motion physics.
2. The Host clicks **Create Room**, enters their nickname, and configures the game settings (e.g., Auto/Manual calling, Auto Call speed, points, and specific Tambola rules like First 5 or Full House).
3. The system generates a unique room code and a sharable URL linking directly to the room.

### Step 2: Guests Join the Room
1. The **Guest** clicks the shareable link (e.g., `/join/ABCD12`).
2. The Guest is instantly directed to a modal prompting for their nickname (bypassing the manual code-entry step).
3. Upon joining, WebSockets immediately synchronize their `GameManager` with the current state of the backend room.

### Step 3: The Game Room & Synchronization
1. The Guest's UI renders their unique Tambola ticket, automatically generated upon joining.
2. Both Host and Guest interfaces display a live, updating list of participants in the room via Socket broadcasts.
3. Depending on the settings, the Host can start the game, which enables manual calling or starts the automated calling interval.
4. Players can mark their tickets interactively and claim prizes (which are verified by the Use Cases in real-time).

---

## 💻 Tech Stack

- **Frontend:** React JS, Vite, TypeScript, Tailwind-style Vanilla CSS, Framer Motion (Animations), Canvas Confetti
- **Backend:** Node.js, Express.js, TypeScript, Socket.io (WebSockets)
- **Database / Persistence:** MongoDB (Room State Persistence)

---

## 🚀 How to Run Locally

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
