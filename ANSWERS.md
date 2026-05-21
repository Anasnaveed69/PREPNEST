# Technical Assessment Answers — PrepNest

This file provides comprehensive answers to the 5 questions required for the technical assessment.

---

## 1. How to Run

To run PrepNest on a fresh machine:

### Prerequisites
Ensure you have **Node.js** installed on your system:
- Recommended version: **v18.0.0** or higher (tested on v22.17.0).
- Check your version in your shell using: `node -v`

### Execution Steps
From the repository root directory (`PrepNest`), run the following commands:

```bash
# 1. Install project dependencies
npm install

# 2. Start the local development server
npm run dev
```

### Accessing the Web Application
Once the compiler completes, it will print the local address. Typically:
- URL: **`http://localhost:5173/`**
Open this address in any modern web browser to interact with the vault!

---

## 2. Stack Choice

### Selected Technologies
- **Core:** React 18, TypeScript 5, Vite 6
- **Styling:** Custom Vanilla CSS (Design system with glassmorphism, responsive grid controls, dark theme, and keyframe animations).
- **Persistence:** Client-side LocalStorage sandboxed storage with parsing schemas.

### Rationale
1. **React + TypeScript + Vite:** Scaffolding a web client using Vite gives us near-instant, high-performance hot reloading and blazing fast builds. TypeScript ensures type-safety, which completely prevents property-access crashes on empty or partially structured questions.
2. **Vanilla CSS:** Avoiding heavy external CSS frameworks (like TailwindCSS or Bootstrap) allows us to design a highly curated, premium glassmorphic dark-theme custom aesthetic. This keeps the application load times low and keeps our styles clean and maintainable.
3. **LocalStorage Persistence:** Since this app must run on a "fresh machine" with zero pre-configurations, choosing client-side LocalStorage is the most robust option. It requires **zero** external database installations, Docker containers, or cloud account setups, while guaranteeing that the user's questions remain perfectly preserved between sessions.

### A Worse Choice & Why
- **Worse Stack Choice:** A full-stack application using **Next.js + PostgreSQL + Docker**.
- **Why?** It would introduce massive overhead for a local assessment. Running database migrations, managing Docker daemon configurations, and setting up local connection strings are highly environment-sensitive. If the target review machine has conflicting ports (like port 5432 for Postgres already taken) or lacks Docker, the setup would break instantly. A lightweight, client-side, self-contained single-page React client is highly resilient and runs successfully in seconds.

---

## 3. One Real Edge Case

### The Edge Case: **Index Out-of-Bounds Crash on Queue Graduation**
- **File:** [`src/components/WeakTopicsReview.tsx`](file:///d:/Github/PrepNest/src/components/WeakTopicsReview.tsx)
- **Line Range:** `L17-L21`

### Explanation
Inside the **Weak Topics Drill** Flashcard Mode, the study stack only loads questions where confidence is `Low`. If a user reads a card, reveals the answer, and rates their confidence as `Medium` or `High`, the card's confidence updates and it is instantly filtered out of the active drill stack.

### What happens without handling?
If the drill stack has 4 items (indices `0`, `1`, `2`, `3`) and the user is reviewing the last card at index `3` (`currentIndex = 3`), graduating this card reduces the drill stack size to 3 (indices `0`, `1`, `2`). 
Without proper safety handling, the component would keep `currentIndex = 3` and attempt to render `weakQuestions[3]`. Since `weakQuestions[3]` is now `undefined`, the application would crash instantly with a fatal error: **`TypeError: Cannot read properties of undefined (reading 'topic')`**, breaking the study session!

### Correct Handling (Lines 17-21 in `WeakTopicsReview.tsx`)
We resolve this gracefully using a React `useEffect` hook that listens to changes in the active stack length:

```typescript
React.useEffect(() => {
  if (currentIndex >= weakQuestions.length && weakQuestions.length > 0) {
    setCurrentIndex(weakQuestions.length - 1);
  }
}, [weakQuestions.length, currentIndex]);
```

If the active card graduates and leaves the index out of bounds, this guard immediately catches it and snaps the cursor safely to the new boundary (`weakQuestions.length - 1`), enabling a seamless, crash-free review transition.

---

## 4. AI Usage

I worked alongside **Antigravity** (Google DeepMind's coding assistant) to plan, design, and build this application.

### AI Engagements
1. **Scaffolding Proposal:** I asked the AI to propose a scaffolding mechanism. It gave me the Vite init options.
2. **CSS Variables Grid:** I requested a premium dark glassmorphic design token scheme. It generated our base variables and transitions.
3. **Markdown Code Splitter:** I asked for a clean, regular-expression-free way to render markdown code blocks in answers. It generated a custom segment-loop parser.

### Modifications Made to AI Output
- **What I Changed:** The AI initially generated a simple React JavaScript setup. I **refused the JS output** and forced it to rewrite the entire data layer (`types.ts`, `storage.ts`) and modules using strict **TypeScript**.
- **Why?** Interview vault items contain multiple union parameters (difficulty is `'Easy' | 'Medium' | 'Hard'`, confidence is `'Low' | 'Medium' | 'High'`). Rasing these as simple JavaScript strings invites spelling mistakes (e.g. typing `"easy"` instead of `"Easy"`) which breaks stats computations. Migrating to strict TypeScript contracts completely prevents state inconsistencies and guarantees type compliance.
- **Micro-interaction Timeout:** The AI initially coded a fast state update in `WeakTopicsReview.tsx` that refreshed cards instantly upon rating. I modified this by introducing a state-controlled transition class (`slideDirection`) and wrapping the actual state update inside a `400ms setTimeout` block. This allows the CSS transform slide animation to play completely before the next card is pulled, resulting in a smooth, high-fidelity experience instead of an abrupt visual pop.

---

## 5. Honest Gap

### The Gap: **Free-form Text Inputs for Tag Categories**
Currently, when a user adds or edits a question, they type the topic tag as a free-form string input (e.g. typing `"React"`, `"DBMS"`, or `"SQL"`). 

### Why this is not good enough
Free-form text inputs are highly prone to user errors. If a user types `"react"` (lowercase) on one card, `"React "` (with a trailing space) on another, and `"React"` on a third, the sorting engine interprets these as **three separate tags**. The dashboard filters will populate duplicate, messy entries, which decreases the organization quality of the vault.

### How I would fix it with another day
With another day, I would implement:
1. **Dynamic Autocomplete Chip Input:** A custom input wrapper that monitors existing tags and suggests them in a dropdown as the user types.
2. **Tokenized Badge Creation:** Allow selecting from existing tags with single clicks, converting them into visual, removable chips inside the modal, completely preventing spelling discrepancies.
