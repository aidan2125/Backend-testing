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
 
document.addEventListener('DOMContentLoaded', () => {
  const capeTownContainer = document.getElementById('cape-town-container');
  const johannesburgContainer = document.getElementById('johannesburg-container');
  const mpumalangaContainer = document.getElementById('mpumalanga-container');
  const durbanContainer = document.getElementById('durban-container');
  const capeTownNextBtn = document.getElementById('cape-town-next-btn');
  const johannesburgPrevBtn = document.getElementById('johannesburg-prev-btn');
  const johannesburgNextBtn = document.getElementById('johannesburg-next-btn');
  const mpumalangaPrevBtn = document.getElementById('mpumalanga-prev-btn');
  const mpumalangaNextBtn = document.getElementById('mpumalanga-next-btn');
  const durbanPrevBtn = document.getElementById('durban-prev-btn');
  const durbanNextBtn = document.getElementById('durban-next-btn');
 
  capeTownNextBtn.addEventListener('click', () => {
    capeTownContainer.style.display = 'none';
    johannesburgContainer.style.display = 'block';
    mpumalangaContainer.style.display = 'none';
    durbanContainer.style.display = 'none';
  });
 
  johannesburgPrevBtn.addEventListener('click', () => {
    johannesburgContainer.style.display = 'none';
    capeTownContainer.style.display = 'block';
    mpumalangaContainer.style.display = 'none';
    durbanContainer.style.display = 'none';
  });
 
  johannesburgNextBtn.addEventListener('click', () => {
    johannesburgContainer.style.display = 'none';
    capeTownContainer.style.display = 'none';
    mpumalangaContainer.style.display = 'block';
    durbanContainer.style.display = 'none';
  });
 
  mpumalangaPrevBtn.addEventListener('click', () => {
    mpumalangaContainer.style.display = 'none';
    johannesburgContainer.style.display = 'block';
    capeTownContainer.style.display = 'none';
    durbanContainer.style.display = 'none';
  });
 
  mpumalangaNextBtn.addEventListener('click', () => {
    mpumalangaContainer.style.display = 'none';
    capeTownContainer.style.display = 'none';
    johannesburgContainer.style.display = 'none';
    durbanContainer.style.display = 'block';
  });
 
  durbanPrevBtn.addEventListener('click', () => {
    durbanContainer.style.display = 'none';
    mpumalangaContainer.style.display = 'block';
    capeTownContainer.style.display = 'none';
    johannesburgContainer.style.display = 'none';
  });
 
  durbanNextBtn.addEventListener('click', () => {
    // Placeholder for future destinations
    console.log('No next destination available');
  });
 
  // Logout functionality
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
 
  // Check user status on load
  checkUser();
});