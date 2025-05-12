// auth.js
import { supabase } from './supabase.js';

// ✅ Get current logged-in user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ✅ Login
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error.message);
    return null;
  }
  return data.user;
};

// Fetch trips associated with the logged-in user
export const getUserTrips = async (profileID) => {
  const { data, error } = await supabase
    .from('trips')
    .select('id, name') // Assuming you have id and name columns in trips table
    .eq('profile_id', profileID);

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return data;
};


// ✅ Sign up
export const signupUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Sign-up error:', error.message);
    return null;
  }
  return data.user;
};

// ✅ Logout
export const logoutUser = async () => {
  await supabase.auth.signOut();
};
