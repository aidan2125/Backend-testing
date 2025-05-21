import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);
 
// Handle form submission
document.getElementById('forgot-password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
 
  const email = document.getElementById('email').value.trim();
  const messageDiv = document.getElementById('message');
 
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5500/update-password.html' // 👈 Change this when in production
  });
 
  if (error) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Error: ' + error.message;
  } else {
    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Reset link sent! Check your email.';
  }
});