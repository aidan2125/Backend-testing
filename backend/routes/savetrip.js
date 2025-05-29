// saveTrip.js (backend route)
/*import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);

export async function saveTripHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profileID, destination, start_date, end_date, activities } = req.body;

  if (!profileID || !destination || !start_date || !end_date || !Array.isArray(activities)) {
    return res.status(400).json({ error: 'Missing or invalid trip data' });
  }

  const { error } = await supabase
    .from('trip_planner')
    .insert([{ profileID, destination, start_date, end_date, activities }]);

  if (error) {
    console.error('❌ Backend insert error:', error.message);
    return res.status(500).json({ error: 'Failed to save trip' });
  }

  return res.status(200).json({ message: 'Trip saved' });
}*/