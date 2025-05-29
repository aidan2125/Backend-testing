// New function to generate itinerary display
/*export function generateItineraryDisplay(tripData) {
  const container = document.getElementById("itinerary-days-container");
  if (!container) return;
 
  container.innerHTML = ""; // Clear previous itinerary
 
  const startDate = new Date(tripData.start_date);
  const endDate = new Date(tripData.end_date);
  const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
 
  // Distribute attractions evenly across days
  const attractionsPerDay = Math.ceil(southAfricanAttractions.length / dayCount);
 
  for (let day = 1; day <= dayCount; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "itinerary-day";
 
    const dayMarker = document.createElement("div");
    dayMarker.className = "day-marker";
    dayMarker.textContent = `Day ${day}`;
 
    const contentDiv = document.createElement("div");
    contentDiv.className = "itinerary-content";
 
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + day - 1);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dayDate.toLocaleDateString(undefined, options);
 
    const dayTitle = document.createElement("h3");
    dayTitle.textContent = `Day ${day} - ${formattedDate}`;
 
    contentDiv.appendChild(dayTitle);
 
    // Get attractions for this day
    const startIdx = (day - 1) * attractionsPerDay;
    const dayAttractions = southAfricanAttractions.slice(startIdx, startIdx + attractionsPerDay);
 
    dayAttractions.forEach(attraction => {
      const attractionDiv = document.createElement("div");
      attractionDiv.className = "attraction-item";
 
      attractionDiv.innerHTML = `
        <img src="${attraction.image}" alt="${attraction.name}" class="itinerary-image" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 8px;" />
        <h4>${attraction.name}</h4>
        <p><strong>Type:</strong> ${attraction.type}</p>
        <p>${attraction.description}</p>
      `;
 
      contentDiv.appendChild(attractionDiv);
    });
 
    dayDiv.appendChild(dayMarker);
    dayDiv.appendChild(contentDiv);
    container.appendChild(dayDiv);
  }
}
 
// Generate default itinerary display on page load
document.addEventListener('DOMContentLoaded', () => {
  const defaultTrip = {
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0]
  };
  generateItineraryDisplay(defaultTrip);
});*/
 