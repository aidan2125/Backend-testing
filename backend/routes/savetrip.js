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

  const requiredFields = [
    'origin',
    'destination',
    'travel_mode',
    'distance',
    'estimated_cost',
    'activities',
    'start_date',
    'end_date',
    'title'
  ];

  for (const field of requiredFields) {
    if (!trip[field]) {
      return res.status(400).json({ message: `Missing required field: ${field}` });
    }
  }

  const userEmail = req.headers['x-user-email'];
  if (!userEmail) {
    return res.status(401).json({ message: 'Unauthorized: missing user info' });
  }

  try {
    // Fetch profile ID
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('profileID')
      .eq('email', userEmail)
      .single();

    if (profileError || !profileData) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Prepare activities as array
    const activitiesArray = trip.activities.split(',').map(a => a.trim());

    console.log("Inserting trip with values: ", {
      profileID: profileData.profileID,
      origin: trip.origin,
      destination: trip.destination,
      travel_mode: trip.travel_mode,
      distance: trip.distance,
      estimated_cost: trip.estimated_cost,
      activities: activitiesArray,
      start_date: trip.start_date,
      end_date: trip.end_date
    }
    )
    // Insert into trip_planner table
    const { error: insertError } = await supabase.from('trip_planner').insert([{
      profileID: profileData.profileID,
      origin: trip.origin,
      destination: trip.destination,
      travel_mode: trip.travel_mode,
      distance: trip.distance,
      estimated_cost: trip.estimated_cost,
      activities: activitiesArray,
      start_date: trip.start_date,
      end_date: trip.end_date,
     
      // destination_point is removed
    }]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ message: insertError.message });
    }

    return res.status(200).json({ message: '✅ Trip saved successfully!' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
