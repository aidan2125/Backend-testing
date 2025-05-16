// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // install if needed: npm install node-fetch
const config = require('./config');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/food', async (req, res) => {
  const { lat, lng } = req.query;
  const url = `${config.googlePlacesUrl}?location=${lat},${lng}&radius=1500&type=restaurant&key=${config.googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
