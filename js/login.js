import { auth } from './firebase.js';
import { loginUser } from './auth.js';
import { getCurrentUser } from './auth.js';

// Redirect to dashboard if user is already logged in
const sessionCheck = async () => {
  const user = await getCurrentUser();
  if (user) {
    localStorage.setItem('profileID', user.profileID);
    window.location.href = 'dashboard.html';
  }
};
sessionCheck();

// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const user = await loginUser(email, password);

  if (!user) {
    alert('Login failed. Please check your credentials and try again.');
    return;
  }

  // Check email verification
  if (!user.emailVerified) {
    alert('Please verify your email before logging in.');
    await auth.signOut(); // Sign out unverified user
    return;
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    alert('Profile not found for this user.');
    return;
  }

  localStorage.setItem('profileID', currentUser.profileID);
  alert('Login successful!');
  window.location.href = 'dashboard.html';
});
