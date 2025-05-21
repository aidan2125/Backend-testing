import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint to serve API keys to frontend safely
app.get('/api/keys', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
});

// Endpoint to receive trip data and do something (e.g., save to DB)
// For now, just echo back the received data
app.post('/api/trip', (req, res) => {
  const tripData = req.body;
  console.log('Received trip data:', tripData);
  // TODO: Save to database or forward to Supabase here
  res.json({ message: 'Trip data received successfully', data: tripData });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
