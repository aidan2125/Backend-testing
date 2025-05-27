import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
// Initialize Supabase client
const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);
 
// Redirect to dashboard if user is already logged in
const sessionCheck = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (data?.session?.user) {
    window.location.href = 'dashboard.html';
  }
};
sessionCheck();
 
// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
 
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
 
  const { data: userData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
 
  if (loginError) {
    alert('Login failed: ' + loginError.message);
    return;
  }
 
  alert('Login successful!');
 
  // Use email to fetch profileID from signup table
  const { data: profileData, error: profileError } = await supabase
    .from('signup')
    .select('profileID')
    .eq('email', email)
    .maybeSingle();
 
  if (profileError) {
    alert('Error fetching profileID: ' + profileError.message);
    return;
  }
  if (!profileData) {
    alert('Profile not found for this email.');
    return;
  } 
 
  console.log('ProfileID:', profileData.profileID);
  localStorage.setItem('profileID', profileData.profileID);
  window.location.href = 'dashboard.html';
});