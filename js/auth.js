
// ✅ Get current logged-in user
export const getCurrentUser = async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) return null;

  const user_id = session.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('signup')
    .select('profileID')
    .eq('user_id', user_id)
    .single();

  if (profileError || !profile) {
    console.error('Failed to fetch profileID from signup table:', profileError);
    return null;
  }

  return { profileID: profile.profileID }; // This becomes the profileID to use everywhere else
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

// ✅ Sign up
export const signupUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('Sign-up error:', error.message);
    return { user: null, message: 'Sign-up failed. Please try again.' };
  }

  // User must verify email first
  return {
    user: null,
    message: 'Sign-up successful! Please check your email to verify your account before logging in.',
  };
};

// ✅ Logout
export const logoutUser = async () => {
  await supabase.auth.signOut();
};

// Fetch trips associated with the logged-in user
export const getUserTrips = async (profileID) => {
  const { data, error } = await supabase
    .from('trip_planner') // Correct table name
    .select('trip_id, destination, start_date, end_date, activities') // Correct columns
    .eq('profileID', profileID); // Correct field name

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return data;
};
