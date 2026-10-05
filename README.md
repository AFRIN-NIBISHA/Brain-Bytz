# BRAIN BYTZ — Technical Quiz Competition Platform
### Python • C • C++ • Java

A high-performance, production-ready web application built for college-level technical quiz competitions. Features real-time participant evaluation, strict anti-cheating session security, zero-client answer exposure, dynamic leaderboards, and an extensive admin analytics suite.

---

## 🚀 Key Features

### 1. Participant Experience
- **Instant Registration**: Collects Full Name, College, Department, and Year of study. No passwords or email verification required for participants.
- **Strict Quiz Flow**: Exactly 25 technical questions (Python, C, C++, Java) displayed one question at a time. Participants cannot skip questions.
- **Zero Answer Visibility**: Correct answers and score calculations are kept strictly on the backend. The participant interface and network responses NEVER contain answers or scores.
- **Live Countdown Timer**: Configurable from Admin (e.g. 25 minutes). Automatically submits on `00:00`.
- **Anti-Cheat & Session Invalidation**: In accordance with competition rules, if a participant closes the browser or abandons the quiz session, the session is invalidated and requires starting fresh from Question 1. Completed submissions remain saved in the database for ranking.
- **Completion Screen**: Clean, professional confirmation screen with zero score or answer leakage.

### 2. Organizer & Admin Dashboard
- **Separate Secure Login**: Protected by JWT authentication (`admin` / `admin123`).
- **Real-Time Leaderboard**: Live rankings sorted by **Score (Descending)** and tie-broken by **Fastest Time Taken (Ascending)**.
- **Search & Multi-Filter**: Filter participants and rankings by Department, College, Year, Score, or Completion Status.
- **Individual Participant Audit**: Click the eye icon on any participant to inspect their complete 25-question submission with selected vs correct answers (admin only).
- **Analytics & Difficulty Matrix**:
  - Score distribution brackets (25, 20-24, 15-19, 10-14, 0-9).
  - Department and College participation breakdowns.
  - Question-by-question accuracy and failure rates (Q01 to Q25).
- **Event Controls**:
  - Open / Close registration.
  - Start / Pause live quiz engine.
  - Configure quiz duration (10, 15, 20, 25, 30, 45, 60 minutes).
  - Reset active incomplete attempts.
  - Clear test / demo records with confirmation dialog.
- **1-Click CSV Export**: Download complete official rankings compatible with Excel / Google Sheets with columns: `Rank`, `Name`, `College`, `Department`, `Year`, `Score`, `Correct`, `Wrong`, `Percentage`, `Time Taken`, and `Submission Time`.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js, JWT, bcryptjs.
- **Database**: SQLite (WAL Mode enabled with full relational schema: `participants`, `questions`, `quiz_attempts`, `answers`, `quiz_settings`, `admin_users`).

---

## 🏁 Running the Application

### 1. Start the Backend Server
```bash
cd Server
npm install
npm start
```
*Server runs on:* `http://localhost:5000`

### 2. Start the Frontend Client
```bash
cd Client
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173` (or `http://localhost:3000`)

---

## 🔑 Admin Credentials

| Role | Username | Password |
|---|---|---|
| **Competition Admin** | `admin` | `admin123` |

Access the admin dashboard anytime via the **"Admin Access"** button in the top right navbar.
