#  EcoTerra: The Living Carbon Engine V1.2

[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-success.svg)](#) 
[![Accessibility](https://img.shields.io/badge/WCAG-Compliant-blue.svg)](#) 
[![Security](https://img.shields.io/badge/Security-XSS_Sanitized-brightgreen.svg)](#) 
[![Hack2Skill](https://img.shields.io/badge/PromptWars-Challenge_3-orange.svg)](#)

**Live Deployment:** [ecoterra-crnn.vercel.app](https://ecoterra-crnn.vercel.app)

EcoTerra is an interactive, gamified carbon footprint awareness platform built for PromptWars Challenge 3. It discards traditional data-heavy dashboards in favor of behavioral psychology. Users log their daily climate actions, and a 2D digital ecosystem instantly thrives or decays based on their real-time carbon offset score.

---

##  The Core Philosophy: Awareness Through Gamification
Data alone rarely changes human behavior—visual consequences do. By tying a user's carbon score to the physical health of a digital island, abstract carbon metrics become immediate, emotional, and personal. 
* **Positive Actions** (e.g., public transit, plant-based meals) heal the island, resulting in clear skies and lush trees.
* **Negative Actions** (e.g., solo driving, high energy waste) degrade the island into a smog-choked wasteland.

---

##  Hackathon Evaluation Metrics Fulfilled

This application was engineered via AI orchestration (Google AI Studio / Gemini) with strict prompts to fulfill the 5 core evaluation pillars of Challenge 3:

### 1. Code Quality & Architecture
* Developed using modern **React (Functional Components)** and **Tailwind CSS**.
* Highly modular architecture, cleanly separating the gamified UI engine (`EcoIsland.jsx`) from the state-mutation logic (`ActionLogger.jsx`).

### 2. Efficiency & Performance
* **React State Memoization:** Utilized `useMemo` for the heavy SVG rendering logic. The visual ecosystem only recalculates when the precise `ecoScore` threshold is crossed, preventing unnecessary DOM repaints.
* Utilized `useCallback` on logging functions to ensure stable prop references across child components.

### 3. Accessibility (Inclusive Design)
* **Screen Reader Ready:** The dynamic SVG ecosystem includes a contextual, state-aware `aria-label` and `role="img"` that verbally describes the exact health of the island to visually impaired users (e.g., *"Visual representation: Polluted ecosystem showing signs of decay"*).
* Fully navigable via standard semantic HTML boundaries.

### 4. Security (Safe Implementation)
* **Client-Side XSS Sanitization:** The Custom Log Entry form utilizes Regex sanitization (`.replace(/[<>]/g, '')`) to strip HTML brackets from user input, protecting against basic Cross-Site Scripting injections.
* **Boundary Hardening:** Custom numerical inputs are strictly validated between `-50` and `+50`, and global state logic forces a strict `0 - 100` boundary to prevent application crashes from extreme values.

### 5. Testing & Usability
* Designed with pure functional logic that makes the application fully prepared for automated Jest / React Testing Library verification. 
* Edge cases (e.g., trying to log positive points when the score is already at maximum) are visually disabled and blocked in the UI.

---

##  Tech Stack & AI Orchestration
* **Frontend:** React.js
* **Styling:** Tailwind CSS
* **Deployment:** Vercel 
* **AI Orchestrator:** Gemini 3.5 Pro (via Google AI Studio)
* **Prompt Strategy:** "Mega-Prompting." Instead of line-by-line coding, the AI was given a master context prompt explicitly mandating the Hack2Skill evaluation metrics (WCAG compliance, useMemo efficiency, and XSS sanitization) to generate the baseline architecture, allowing human focus on UI/UX and behavioral flow.

---

##  Local Setup Instructions

To run this project locally:

1. Clone the repository:
   ```bash
   git clone [https://github.com/](https://github.com/)saieswar237/ecoterra.git
