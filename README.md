<div align="center">

# ⚡ PrepNest
**Persistent Interview Prep Vault & Spaced Recall Engine**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](https://opensource.org/licenses/MIT)

An offline-first, Neobrutalist spaced repetition engine engineered specifically for elite developers. Organize system design, algorithm, and coding blueprints and drill them with lightning-fast keyboard shortcuts.

[Features](#-core-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Design System](#-design-system)

</div>

---

## 🚀 Overview

**PrepNest** is a state-of-the-art, premium single-page application built with **React** and **TypeScript**. It serves as a persistent technical interview preparation vault. Utilizing a completely custom CSS variable architecture, it offers a stunning, theme-aware **Neobrutalist UI** that effortlessly toggles between high-contrast Dark and Light modes.

Beyond standard CRUD mechanics, PrepNest introduces an immersive **Focus Drill Flashcard Engine** powered by spaced recall principles and a mathematically weighted **Interview Readiness Index** to deliver a production-grade developer preparation utility.

## ✨ Core Features

### 🗄️ 1. Robust Question Vault
- **Dynamic Organization:** Add, update, search, and categorize system design notes, React hook patterns, or algorithmic blueprints.
- **Interactive Details:** View difficulty levels (colored Emerald, Amber, Crimson) and expand answers to read detailed explanations with smooth cubic-bezier drawer transitions.
- **Zero-Dependency Markdown Engine:** Includes a custom text-block parser that scans answer text for fenced blocks (e.g., ` ```javascript `), rendering them as formatted code blocks with syntax highlighting and interactive "Copy to Clipboard" functionality.

### 🧠 2. Focus Drill Engine (Spaced Recall)
Filters topics with `Low` confidence, placing them in an immersive, full-screen study session.
- **3D Card Mechanics:** Fluid hardware-accelerated 3D flips using CSS transforms.
- **Keyboard-First Navigation:** 
  - <kbd>Space</kbd> / <kbd>Enter</kbd>: Toggle Reveal Answer
  - <kbd>1</kbd> (Low): Keeps card in the current active rotation queue.
  - <kbd>2</kbd> (Medium) / <kbd>3</kbd> (High): Graduates card out of the queue, triggering a smooth horizontal slide-out animation.
  - <kbd>←</kbd> / <kbd>→</kbd> : Cycle cards manually.

### 📊 3. Interview Readiness Index
A proprietary weighted algorithm calculates your exact interview preparedness:
- Maps difficulty weighting (**Easy: 1x**, **Medium: 2x**, **Hard: 3x**).
- Applies confidence multipliers (**High: 1.0**, **Medium: 0.5**, **Low: 0.0**).
- Yields a realistic, aggregate percentage representation of your readiness for technical evaluations.

### 💾 4. Seamless Offline Backups
- **No Database Required:** High-performance persistence utilizing the browser's native `localStorage` sandbox with robust schema guards.
- **Portable JSON:** Securely export your entire vault as a structured JSON backup file, and import previously saved states via the native `FileReader` API.

---

## 🎨 Design System

PrepNest utilizes a custom **Neobrutalist Design System** that avoids external CSS frameworks (like Tailwind or Bootstrap) in favor of deep, semantic Vanilla CSS variables.

- **Theme Agnostic:** Employs CSS Variables (`--card-bg`, `--neo-border-color`, `--text-primary`) to allow instantaneous toggling between a Carbon Dark Mode and an Off-White Light Mode.
- **Mechanical Feedback:** UI elements provide immediate, tactile visual feedback via heavy 2px solid borders and offset box shadows (`var(--card-shadow)`).
- **Typography:** Uses **Plus Jakarta Sans** for crisp UI elements and **JetBrains Mono** for technical code block rendering.

---

## ⚡ Quick Start

To launch the local development environment on any fresh machine, ensure you have **Node.js** (v18 or higher recommended) installed.

### 1. Clone & Install
```bash
git clone https://github.com/Anasnaveed69/PrepNest.git
cd PrepNest
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

The application will compile in milliseconds and host a local dev server at `http://localhost:5173`. Open the URL in your browser to begin drilling.

### 3. Production Build
```bash
npm run build
```
Generates a highly optimized, minified production build in the `/dist` directory ready for deployment to Vercel, Netlify, or GitHub Pages.

---

## 🛠️ Architecture Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Core component architecture and reactive state management. |
| **TypeScript 5** | Strict type interfaces for robust compile-time safety and self-documenting prop schemas. |
| **Vite 6** | Ultra-fast HMR and optimized production rollup bundling. |
| **Vanilla CSS** | Zero-dependency, highly scalable CSS Variable architecture for the Neobrutalist UI. |

---

<div align="center">
  <p>Engineered for elite developers. Conquer your engineering interviews.</p>
</div>
