import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


export async function saveTripHandler(req, res) {
  const trip = req.body;
  console.log("Received trip data:", trip);

  const requiredFields = ['origin', 'destination', 'travelMode', 'distance', 'cost', 'activities'];
  for (const field of requiredFields) {
    if (!trip[field]) {
      return res.status(400).json({ message: `Missing required field: ${field}` });
    }
  }

  // Get user email from headers (adjust based on your auth method)
  const userEmail = req.headers['x-user-email'];
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized: missing user info' });
  }

  try {
    // Fetch profileID for user
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('profileID')
      .eq('email', userEmail)
      .single();

    if (profileError || !profileData) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const activitiesArray = trip.activities.split(',').map(a => a.trim());

    const { error: insertError } = await supabase.from('trip_planner').insert([{
      profileID: profileData.profileID,
      origin: trip.origin,
      destination: trip.destination,
      travel_mode: trip.travelMode,
      distance: trip.distance,
      estimated_cost: trip.cost,
      activities: activitiesArray,
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    }]);

    if (insertError) {
      return res.status(500).json({ message: insertError.message });
    }

    return res.status(200).json({ message: 'Trip saved successfully' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

