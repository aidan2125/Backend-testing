/*import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { saveTripHandler } from './routes/savetrip.js';
import cors from 'cors';

dotenv.config();

const app = express();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(bodyParser.json());
app.use(cors());

app.post('/api/savetrip', saveTripHandler);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/