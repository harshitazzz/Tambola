# 🎡 Tambola Real-Time

A premium, highly-interactive, and aesthetically pleasing full-stack digital version of the classic Indian bingo game, Tambola. Built with a focus on real-time synchronization and clean software architecture.

🚀 **Live Demo:** [https://tambola-qmn8.onrender.com](https://tambola-qmn8.onrender.com)

## ✨ Features

- **Real-Time Multiplayer:** Create private rooms and play with friends using unique room codes.
- **Automated/Manual Calling:** The host can choose to call numbers manually or set an automatic interval (3s, 5s, 7s).
- **Smart Ticket Generation:** Uses a backtracking algorithm to generate valid, balanced tickets.
- **Automated Claim Validation:** Instantly validates claims (Top Line, Full House, etc.) using the Strategy Pattern.
- **Immersive Visuals:** features a Three.js interactive background and smooth Framer Motion animations.
- **Sound Effects:** Audio cues for number calls and winning claims.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Three.js, Tailwind CSS, Framer Motion.
- **Backend:** Node.js, Express, Socket.io.
- **Database:** MongoDB (via Mongoose) for session persistence.
- **Architecture:** Clean Architecture / Domain-Driven Design (DDD).

## 🏗️ Project Structure

├── backend/
│   ├── src/
│   │   ├── controllers/    # API Request Handlers
│   │   ├── models/         # Room & Game State Logic
│   │   ├── persistence/    # MongoDB/Mongoose Schemas
│   │   └── services/       # RoomManager (Singleton)
├── website/
│   ├── src/
│   │   ├── domain/         # Core Entities (Game, Ticket)
│   │   ├── application/    # Use Cases & Claim Strategies
│   │   ├── infrastructure/ # Sockets & Game Manager
│   │   └── presentation/   # React Components & Hooks
🚀 Getting Started


Installation
Clone the repo:

Bash
git clone [https://github.com/your-username/tambola.git](https://github.com/your-username/tambola.git)
cd tambola
Setup Backend:

Bash
cd backend
npm install
cp .env.example .env # Update with your MONGODB_URI
npm run dev
Setup Frontend:

Bash
cd website
npm install
npm run dev

## How to Play
Host: Click "Create Room," set your nickname and game rules, then share the room code.

Joiner: Enter the room code and your nickname to enter the lobby.

Play: Once the host starts, mark numbers as they are called.

Claim: Click the "Claim" button when you complete a pattern. The system will automatically verify it!
