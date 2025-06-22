import { signupUser } from './auth.js';

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validate user first
  if (phone.length < 10) {
    alert('Phone number must be at least 10 digits long.');
    return;
  }

  const { user, message } = await signupUser(name, surname, phone, email, password);

  if (!user) {
    alert(message);
    if (message.includes('verify')) {
      window.location.href = 'login.html';
    }
    return;
  }

  alert('Signup successful! Please log in.');
  window.location.href = 'login.html';
});
