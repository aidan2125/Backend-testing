import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { data: userData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Login successful!');

    // Fetch the profileID from the signup table using the authenticated user ID
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('profileID')
      .eq('email', email)  // Assuming 'email' is unique for each profile
      .single(); // Get a single row

    if (profileError) {
      alert('Error fetching profileID: ' + profileError.message);
    } else {
      console.log('ProfileID:', profileData.profileID);
      // Store the profileID and redirect to the dashboard
      localStorage.setItem('profileID', profileData.profileID); // Save profileID to localStorage or sessionStorage
      window.location.href = 'dashboard.html';
    }
  }
});
