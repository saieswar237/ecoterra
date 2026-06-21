# 🌍 EcoTerra V1.2: The Living Carbon Engine

[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-success.svg)](#) 
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](#)
[![Vite](https://img.shields.io/badge/Vite-Optimized-purple.svg)](#)
[![Built with AI Studio](https://img.shields.io/badge/Built_with-Google_AI_Studio-orange)](https://ai.studio/apps/49c671e5-aafd-49fe-b3e8-79ae62f99a48)

**Live Deployment:** [ecoterra-crnn.vercel.app](https://ecoterra-crnn.vercel.app)

**EcoTerra** is an interactive, gamified 2D carbon footprint emulator built for PromptWars Challenge 3. Moving beyond static data dashboards, it leverages behavioral psychology to drive climate action. As users log their daily activities, a digital biosphere instantly thrives or decays based on their real-time carbon offset score.

---

## 🧠 System Architecture & Engineering Complexity

This project was engineered to maximize performance, accessibility, and security using an AI-orchestrated development pipeline:

*   **State-Driven Ecosystem Render:** The 2D visual island relies on complex state memoization. Utilizing React's `useMemo` and `useCallback`, the application strictly controls DOM repaints. The dynamic SVGs only recalculate when specific `ecoScore` thresholds are crossed, ensuring maximum frontend efficiency.
*   **Inclusive Accessibility (WCAG):** The dynamic visual ecosystem includes state-aware `aria-labels` and `role="img"`. This ensures that screen readers can actively describe the exact physical health of the decaying or thriving island to visually impaired users.
*   **Security & Input Sanitization:** Custom user inputs are protected against Cross-Site Scripting (XSS) via strict Regex boundary checking. Numerical inputs are hard-capped and validated to prevent state overflow crashes.
*   **AI Orchestration:** The core logic, rendering engine, and security metrics were generated using Gemini 1.5 Pro via Google AI Studio through a highly-constrained architecture strategy.

---

## 🛠️ Tech Stack
*   **Frontend Framework:** React 18
*   **Language:** TypeScript
*   **Build Tool:** Vite (for lightning-fast HMR and optimized production builds)
*   **Styling:** Tailwind CSS
*   **AI Engine:** Google AI Studio (Gemini)

---

## 💻 Run Locally

**Prerequisites:** Node.js installed on your machine.

1. **Clone and install dependencies:**
```bash
   git clone [https://github.com/saieswar237/ecoterra.git](https://github.com/saieswar237/ecoterra.git)
   cd ecoterra
   npm install
