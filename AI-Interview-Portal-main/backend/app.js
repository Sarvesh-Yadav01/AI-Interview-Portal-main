const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const { connectDB } = require("./config/db");
const { validateEnv, isProduction } = require("./config/env");
const { attachUser } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

validateEnv();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

// Enable CORS for React frontend (supports credentials like cookies/headers)
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Key"]
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ai_interview_session_secret_default_32chars",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      maxAge: 60 * 60 * 1000
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));
// Serve built React client if available in client/dist
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use(attachUser);

// REST API Routes (MERN Stack)
app.use("/api/auth", require("./routes/apiAuthRoutes"));
app.use("/api/interview", require("./routes/apiInterviewRoutes"));
app.use("/api/dashboard", require("./routes/apiDashboardRoutes"));
app.use("/api/admin", require("./routes/apiAdminRoutes"));
app.use("/api/resume", require("./routes/apiResumeRoutes"));

// Legacy SSR routes (kept for backwards-compatibility)
app.use("/", require("./routes/pageRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/interview", require("./routes/interviewRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

// Catch-all for API requests
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// SPA fallback: If client/dist/index.html exists, serve it
const clientDistIndex = path.join(__dirname, "../client/dist/index.html");
const fs = require("fs");
if (fs.existsSync(clientDistIndex)) {
  app.get("*", (req, res) => {
    res.sendFile(clientDistIndex);
  });
}

app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.use((error, req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).redirect("/interview");
  }

  console.error("Server Error:", error.message);
  res.status(500).render("404", { title: "Something Went Wrong" });
});

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
    console.log(`API endpoints accessible at http://localhost:${port}/api/`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = Number(port) + 1;
      console.log(`Port ${port} is already in use. Trying http://localhost:${nextPort}`);
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    throw error;
  });
}

connectDB()
  .then(() => startServer(Number(PORT)))
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  });
