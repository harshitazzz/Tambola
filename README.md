Tambola — Real-Time Multiplayer Game Platform

Live Demo: https://tambola-qmn8.onrender.com

Tambola (Housie/Bingo) is a real-time multiplayer number game platform that allows players to create rooms, join instantly, and play together from anywhere. The system automates number calling, ticket generation, claim validation, and synchronization — removing all manual effort from traditional gameplay.

## Features

*  Real-Time Multiplayer Gameplay using WebSockets
*  Instant Room Creation & Shareable Links
*  Auto-Generated Valid Tambola Tickets (3×9 grid)
*  Text-to-Speech Number Calling (TTS)
*  Auto / Manual Number Calling Modes
*  Automatic Claim Validation (No disputes)
*  Multiple Winning Strategies
    * Early 5
    * Top Line
    * Middle Line
    * Bottom Line
    * Full House
    * Corners
    * Big & Small
*  State Persistence (MongoDB) — recover game after refresh
*  Real-Time Synchronization across all players
*  Confetti + Sound Effects for wins
*  Reconnect & Hydration Support
*  Player Join/Leave Tracking

⸻
System Architecture

Tambola follows a client-server architecture with real-time event-driven communication.

* Frontend: React (Clean Architecture)
* Backend: Node.js + Express + Socket.io
* Database: MongoDB

 High-Level Flow

1. Host creates room via REST API
2. Players join via WebSocket (join_room)
3. Server sends full state (room_state_sync)
4. Game runs via real-time events:
    * call_number
    * mark_number
    * claim
5. Server broadcasts updates → all clients sync instantly

⸻

 Clean Architecture (Frontend)

website/src/
├── domain/          # Entities (Game, Player, Ticket)
├── application/     # Use Cases (business logic)
├── infrastructure/  # GameManager, SocketService, SoundService
├── presentation/    # React components & hooks

Layers Explained:

* Domain Layer: Core business models (pure TypeScript)
* Application Layer: Game rules (Use Cases)
* Infrastructure Layer: External interactions (WebSocket, Audio, State)
* Presentation Layer: UI (React Components)

⸻

⚙️ Backend Architecture

backend/src/
├── models/          # Room logic
├── routes/          # REST APIs
├── services/        # RoomManager (core logic)
├── persistence/     # MongoDB (Mongoose)

* RoomManager (Singleton): Manages all active rooms
* Socket.io: Real-time communication
* MongoDB: Persistent room state

⸻

 Design Patterns Used

🔹 Singleton Pattern

Used in:

* GameManager
* SocketService
* RoomManager

➡ Ensures a single source of truth for game state and connections.

⸻

🔹 Strategy Pattern

Used for claim validation logic

* Early5Strategy
* TopLineStrategy
* FullHouseStrategy
* etc.

➡ Allows adding new rules without modifying existing code

⸻

🔹 Factory Pattern

* ClaimStrategyFactory

➡ Dynamically creates strategy objects based on claim type

⸻

🔹 Observer Pattern

* GameManager + useGameState

➡ Automatically updates UI when game state changes

⸻

🧱 SOLID Principles

* S (SRP): Each class has one responsibility
* O (OCP): Add new features without modifying existing code
* L (LSP): All strategies interchangeable
* I (ISP): Small, focused interfaces
* D (DIP): Depends on abstractions, not concrete classes

⸻

 API Endpoints

Method	Endpoint	Description
POST	/api/rooms/create	Create room
POST	/api/rooms/join	Join room
POST	/api/rooms/start	Start game
GET	/api/rooms/get/:code	Get room state
GET	/health	Health check

⸻

 Real-Time Events

Event	Description
join_room	Join game room
room_state_sync	Sync full state
call_number	Call number
number_called	Broadcast number
mark_number	Mark ticket
claim	Claim prize
claim_result_broadcast	Share result
player_left	Handle disconnect

⸻

 Tech Stack

Layer	Tech
Frontend	React + Vite + TypeScript
Backend	Node.js + Express
Real-Time	Socket.io
Database	MongoDB + Mongoose
Styling	Tailwind CSS
Animation	Framer Motion
3D	Three.js
Audio	Web Audio API

⸻

⚡ Setup Instructions

1. Clone Repo

git clone https://github.com/[your-repo]/tambola.git

2. Backend Setup

cd backend
npm install

Create .env:

MONGO_URI=mongodb://127.0.0.1:27017/tambola
ROOM_TTL_HOURS=12
PORT=3000

Run:

npm run dev

⸻

3. Frontend Setup

cd website
npm install

Create .env:

VITE_BACKEND_URL=http://localhost:3000

Run:

npm run dev

⸻
👩‍💻 Author

Harshita (Team Lead), Manan Gilhotra, Yashi Agarwal , Akhil Mishra , Adamya Tiwari

Report link : https://docs.google.com/document/d/1VFo2LW-968Fv8BRMBQE1VBbWMwrKR_FAsXrWP6O3mZA/edit?usp=sharing
Product hunt: https://www.producthunt.com/products/tambola?utm_source=twitter&utm_medium=social
