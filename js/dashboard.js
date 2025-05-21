import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
 
const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);
 
// Async function to handle login check
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
 
  if (!user) {
    window.location.href = 'login.html'; // redirect if not logged in
  } else {
    document.getElementById('user-email').textContent = `Logged in as: ${user.email}`;
  }
}
 
// Logout functionality
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});
 
// Check user status on load
checkUser();
 