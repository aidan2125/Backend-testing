import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://lmtvzmagwdegwravdcue.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU",
);

// Async function to handle login check
async function checkUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html"; // redirect if not logged in
  } else {
    const userEmailElement = document.getElementById("user-email");
    if (userEmailElement) {
      userEmailElement.textContent = user.email || "User";
    }
  }
}

// Safe element selection with null checking
function safeGetElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
  }
  return element;
}

// Safe event listener addition
function safeAddEventListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard loaded, initializing...");

  // Initialize logout functionality
  const logoutBtn = safeGetElement("logout-btn");
  safeAddEventListener(logoutBtn, "click", async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error:", error);
    }
  });

  // Initialize destination tabs (these are handled by the inline JavaScript in the HTML)
  // The tab functionality is already implemented in the HTML file

  // Initialize scroll animations for elements that come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      }
    });
  }, observerOptions);

  // Observe elements with data-aos attribute
  document.querySelectorAll("[data-aos]").forEach((el) => {
    observer.observe(el);
  });

  // Initialize counter animation for stats
  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
      const target = parseFloat(counter.textContent);
      const increment = target / 50;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        if (counter.textContent.includes("k")) {
          counter.textContent = (current / 1000).toFixed(1) + "k";
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 30);
    });
  }

  // Start counter animation when stats section is visible
  const statsSection = document.querySelector(".travel-stats");
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    });
    statsObserver.observe(statsSection);
  }

  // Check user status on load
  checkUser();

  console.log("Dashboard initialization complete");
});
