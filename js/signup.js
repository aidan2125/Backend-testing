import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (phone.length < 10) {
    alert('Phone number must be at least 10 digits long.');
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login.html`  // Redirect here after email confirmation
    }
  });

  if (error) {
    alert('Signup failed: ' + error.message);
    return;
  }

  const userID = data?.user?.id;

  if (!userID) {
    alert('Signup initiated. Please check your email to confirm your address before logging in.');
    return;
  }

  const { error: profileError } = await supabase.from('signup').insert([{
    profileID: userID,
    name,
    surname,
    phone_number: phone,
    email
  }]);

  if (profileError) {
    alert('Profile insert failed: ' + profileError.message);
  } else {
    alert('Signup successful! Please check your email to verify your account.');
  }
});
