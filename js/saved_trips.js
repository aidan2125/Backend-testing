import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);

const tripsContainer = document.getElementById('trips-container');

async function loadSavedTrips() {
  // Check for logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    tripsContainer.innerHTML = '<p>Please log in to view your trips.</p>';
    return;
  }

  // Get profile ID based on email
  const { data: profileRow, error: profileError } = await supabase
    .from('signup')
    .select('profileID')
    .eq('email', user.email)
    .single();

  if (profileError || !profileRow) {
    tripsContainer.innerHTML = '<p>⚠️ Profile not found.</p>';
    return;
  }

  const profileID = profileRow.profileID;

  // Get all trips for the user
  const { data: trips, error: tripsError } = await supabase
    .from('trip_planner')
    .select('*')
    .eq('profileID', profileID);

  if (tripsError || !trips || trips.length === 0) {
    tripsContainer.innerHTML = '<p>You have no saved trips yet.</p>';
    return;
  }

  tripsContainer.innerHTML = ''; // Clear loading indicator

  // 🔄 Fetch expenses for each trip and merge into trip data
  const tripsWithExpenses = await Promise.all(
    trips.map(async (trip) => {
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', trip.trip_id);

      return {
        ...trip,
        expenses: expenses || [],
      };
    })
  );

  // 💡 Render each trip card including expense info
  tripsWithExpenses.forEach(trip => {
    const tripCard = document.createElement('div');
    tripCard.className = 'trip-card';
    tripCard.innerHTML = `
      <h3>📍 ${trip.destination}</h3>
      <p><strong>Start:</strong> ${trip.start_date?.split('T')[0]}</p>
      <p><strong>End:</strong> ${trip.end_date?.split('T')[0]}</p>
      <p><strong>Activities:</strong> ${trip.activities?.join(', ') || 'None'}</p>
      <p><strong>Total Expenses:</strong> ${trip.expenses.length}</p>
      <button class="details-btn">🔍 Details</button>
      <button class="delete-btn" data-id="${trip.trip_id}">🗑 Delete</button>
    `;

    // 🧾 Show detailed modal with expenses
    tripCard.querySelector('.details-btn').addEventListener('click', () => {
      document.getElementById('modal-destination').textContent = `Trip to ${trip.destination}`;
      document.getElementById('modal-start').textContent = trip.start_date?.split('T')[0];
      document.getElementById('modal-end').textContent = trip.end_date?.split('T')[0];
      document.getElementById('modal-activities').textContent = trip.activities?.join(', ') || 'None';

      // 📋 Format expense list in modal
      const expensesList = trip.expenses.length > 0
        ? trip.expenses.map(exp => `
            <li>${exp.name}: ${exp.amount} ${exp.currency || ''} (${exp.category || 'Uncategorized'})</li>
          `).join('')
        : '<li>No expenses yet.</li>';

      document.getElementById('modal-notes').innerHTML = `
        <strong>Expenses:</strong>
        <ul>${expensesList}</ul>
      `;

      document.getElementById('trip-modal').style.display = 'block';
    });

    tripsContainer.appendChild(tripCard);
  });

  // 🗑 Delete trip
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const tripId = e.target.getAttribute('data-id');
      const { error } = await supabase
        .from('trip_planner')
        .delete()
        .eq('trip_id', tripId);

      if (!error) {
        e.target.parentElement.remove();
      } else {
        alert('Failed to delete trip.');
      }
    });
  });
}

// ❌ Close modal handler
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('trip-modal').style.display = 'none';
});

// 🚀 Load all data
loadSavedTrips();
