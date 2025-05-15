const express = require('express');
const fetch = require('node-fetch'); // or use native fetch if using Node 18+
const cors = require('cors');
const app = express();


app.use(cors()); // Allow requests from your frontend

const apiKey = 'AIzaSyCvI8oz4lpujGMNdk28vTHf6useyP8a9tc';

app.get('/api/food', async (req, res) => {
  const { lat, lng } = req.query;
  const radius = 3000;
  const type = 'restaurant';

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data); // Send it to the frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data from Google Places' });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
