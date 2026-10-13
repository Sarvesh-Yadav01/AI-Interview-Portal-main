# AI Interview Portal (MERN Stack)

AI-powered corporate recruitment and placement interview portal built with the **MERN Stack** (**M**ongoDB, **E**xpress.js, **R**eact.js, **N**ode.js). Features sequential rounds, webcam and screen-sharing proctoring, speech-to-text voice rounds, ATS resume scoring, admin analytics, and AI evaluations.

---

## 🌟 Key Features

- **Sequential 3-Stage Interview Pipeline:**
  1. **Aptitude & Reasoning:** 10 industry MCQs (Quantitative, Logical, Verbal, Puzzles) with 60% passing requirement.
  2. **Technical Specialization:** 60+ domain tracks (MERN Stack, Python, Java, DevOps, GenAI, DSA) with 7 MCQs + 3 architecture/code questions.
  3. **Voice Interview:** Live spoken HR & communication interview utilizing the browser's Web Speech API with real-time speech-to-text transcription.
- **Enterprise Proctoring & Anti-Cheat:**
  - Continuous webcam presence and screen-share monitor using browser WebRTC MediaStreams.
  - Tab switch detection (`visibilitychange`) and focus loss detection (`blur`).
  - Automatic termination and violation alerts if screen share is stopped or tabs are switched.
- **AI Feedback & Scoring:** Instant scoring with OpenAI GPT (and offline fallback mode when no API key is provided).
- **ATS Resume Analyzer:** Upload PDF resumes to extract text and generate an ATS match percentage, keyword analysis, and suggestions.
- **Official PDF Report Card:** Downloadable PDF report generated with PDFKit.
- **Admin Surveillance Console:** Track candidate scores, pass rates, violation logs, and email performance reports.
- **Email Notifications:** OTP verification, congratulations email on qualifying all 3 rounds, and violation notices via Nodemailer.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 (Vite SPA), Lucide Icons, Chart.js (`react-chartjs-2`), Axios, WebRTC, Web Speech API
- **Backend:** Node.js, Express.js (REST API + CORS)
- **Database:** MongoDB (via Mongoose ODM)
- **Security:** JWT authentication, bcryptjs, Helmet, rate-limiting
- **AI & Processing:** OpenAI SDK, PDFKit, pdf-parse, Multer

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 20
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 2. Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Example `.env` configuration:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-interview-portal
# Or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-interview-portal
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=replace_with_another_secret_at_least_32_characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=replace_with_a_strong_admin_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=AI Interview Portal <your_email@example.com>
```

> **Note:** If `OPENAI_API_KEY` is not provided, the portal automatically operates in local fallback mode with built-in aptitude & technical interview question banks. If SMTP is not configured, OTPs are printed in the server logs and displayed in dev alert banners.

---

## 💻 Running the Application

### Option A: Development Mode (Vite Dev Server + Express API)

In Terminal 1 (Start Express API):
```bash
npm run dev
```
*Starts both the Express Backend API (`http://localhost:3000`) and the Vite React Frontend (`http://localhost:5173`) concurrently in one terminal!*

*(Or run separately: `npm run backend` and `npm run client`)*

---

### Option B: Production / Single-Port Mode

Compile the React frontend and run everything through Express on port 3000:

```bash
npm run build
npm start
```

Open `http://localhost:3000` in your browser!

---

## 📂 Project Architecture

```text
AI-Interview-Portal/
├── backend/                    # Dedicated Express & MongoDB Backend
│   ├── config/
│   │   ├── db.js               # Mongoose MongoDB connection
│   │   └── env.js              # Environment validator
│   ├── controllers/            # REST API Controllers (Auth, Interview, Dashboard, Admin, Resume)
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose Models (User.js, InterviewResult.js)
│   ├── routes/                 # REST API Routes (/api/*)
│   ├── services/               # AI Engine, Nodemailer, PDFKit, PDF Resume Parser
│   ├── uploads/                # Temporary file uploads
│   ├── app.js                  # Express server entry point
│   └── package.json            # Backend package config
│
├── client/                     # Dedicated React Frontend (Vite SPA)
│   ├── src/
│   │   ├── api/apiClient.js    # Axios client with JWT interceptor
│   │   ├── context/AuthContext.jsx # Candidate & Admin auth state
│   │   ├── hooks/useProctoring.js # Camera, screen sharing, anti-cheat detection
│   │   ├── hooks/useSpeechRecognition.js # Web Speech API voice transcription
│   │   ├── pages/              # Home, Dashboard, InterviewRoom, Result, ResumeATS, Admin
│   │   └── App.jsx             # React Router structure
│   └── package.json            # React frontend config
│
├── .env                        # Environment variables (MongoDB URI, AI key, JWT secrets)
└── package.json                # Root automation scripts (dev, build, start)
```
