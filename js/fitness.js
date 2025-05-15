// Fitness form submission
document.querySelector('.fitnessForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const workoutType = document.getElementById('workout-type').value;
  const timeAvailable = document.getElementById('time-available').value;

  // Generate fitness plan based on user preferences
  alert(`Generating a ${workoutType} plan for ${timeAvailable} minutes`);
});

// Hydration Tracker
let totalWaterIntake = 0;

document.getElementById('log-water').addEventListener('click', function() {
  const waterIntake = document.getElementById('water-intake').value;
  totalWaterIntake += parseInt(waterIntake, 10);
  alert(`You've logged ${waterIntake} ml of water! Total: ${totalWaterIntake} ml`);
});
