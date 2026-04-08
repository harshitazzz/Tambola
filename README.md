# Tambola 🎲

A modern, highly-interactive, and aesthetically pleasing cross-platform digital version of the classic Indian bingo game, Tambola.

This project repository contains two distinct front-ends built on a shared conceptual architecture.

## 📱 Platforms

### 1. Website (`/website`)
A responsive web application built with **React JS**, **TypeScript**, and **Vite**.
- **Aesthetics:** Creamy beige background adorned with soft gradients, floating glassmorphic container elements, and the iconic "Tambola Royale" green.
- **Interactivity:** Features complex, physics-based dropping text animations and stagger entrances using **Framer Motion**, accompanied by a subtle interactive background bokeh effect using **ThreeJS**.
- **Run Locally:**
  ```bash
  cd website
  npm install
  npm run dev
  ```

### 2. Mobile App (`/mobile`)
A fluid native app built using **React Native**, **TypeScript**, and **Expo**.
- **Aesthetics:** Perfect parity with the website UI, delivering the creamy background via `expo-linear-gradient` and crisp native typography.
- **Interactivity:** Leverages React Native's built-in `Animated` API for butter-smooth dropping text physics (`Animated.stagger` and spring constraints) mimicking the web experience.
- **Run Locally:**
  ```bash
  cd mobile
  npm install
  npm start
  # Then press 'a' for Android or 'i' for iOS Simulator
  ```

## 🛠 Tech Stack
- **Frameworks:** React JS (Web) / React Native (Mobile)
- **Tooling:** Vite / Expo
- **Language:** TypeScript
- **Styling:** CSS-in-JS & Vanilla CSS
- **Animations:** Framer Motion (Web) / React Native Animated (Mobile)
- **3D Graphics:** ThreeJS (Web)
- **Icons:** Lucide React / Lucide React Native

## 🎮 Features Currently Implemented
- Beautiful Hero Section with Physics-based letter drops
- Navigation UI & Branding
- Create / Join Room Portals
- Shared Green & Cream aesthetic bridging iOS, Android, and Web platforms.
