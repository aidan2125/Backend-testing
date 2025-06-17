import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve CSS files with correct MIME type
app.use(
  "/css",
  express.static(path.join(__dirname, "css"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.set("Content-Type", "text/css");
      }
    },
  }),
);

// Serve JS files with correct MIME type
app.use(
  "/js",
  express.static(path.join(__dirname, "js"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.set("Content-Type", "application/javascript");
      }
    },
  }),
);

// Serve images
app.use("/Images", express.static(path.join(__dirname, "Images")));

// Route for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Specific routes for known HTML files
const htmlFiles = [
  "dashboard.html",
  "expenses.html",
  "food.html",
  "health.html",
  "hub.html",
  "itienary.html",
  "login.html",
  "profile.html",
  "reset.html",
  "saved_trips.html",
  "signup.html",
  "tips.html",
  "trip-planner.html",
  "weather.html",
];

htmlFiles.forEach((file) => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
});
