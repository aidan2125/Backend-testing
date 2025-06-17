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

// Fallback to index.html for SPA-style routing
app.get("*", (req, res) => {
  // If it's a request for a specific HTML file, serve it
  if (req.path.endsWith(".html")) {
    res.sendFile(path.join(__dirname, req.path));
  } else if (req.path === "/") {
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    // For other routes, try to find the file or fallback to index.html
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, "index.html"));
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
});
