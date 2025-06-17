import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://lmtvzmagwdegwravdcue.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU",
);

// Async function to handle login check with error handling
async function checkUser() {
  try {
    const userEmailElement = document.getElementById("user-email");

    // Set loading state
    if (userEmailElement) {
      userEmailElement.textContent = "Loading...";
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Supabase auth error:", error);
      handleAuthError(error);
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to login");
      window.location.href = "login.html";
    } else {
      console.log("User authenticated:", user.email);
      if (userEmailElement) {
        userEmailElement.textContent = user.email || "User";
      }
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    handleAuthError(error);
  }
}

// Handle authentication errors gracefully
function handleAuthError(error) {
  const userEmailElement = document.getElementById("user-email");

  if (
    error.message?.includes("Failed to fetch") ||
    error.name === "TypeError"
  ) {
    // Network or connectivity issue
    console.warn("Network connectivity issue detected");
    if (userEmailElement) {
      userEmailElement.textContent = "Offline Mode";
      userEmailElement.style.color = "#ff9800";
      userEmailElement.title = "Unable to connect to authentication service";
    }

    // Allow user to continue using the dashboard in offline mode
    showOfflineNotification();
  } else {
    // Other authentication errors - redirect to login
    console.error("Authentication failed, redirecting to login");
    window.location.href = "login.html";
  }
}

// Show offline notification
function showOfflineNotification() {
  // Create notification if it doesn't exist
  let notification = document.getElementById("offline-notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "offline-notification";
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        <i class="fas fa-wifi" style="margin-right: 8px; opacity: 0.7;"></i>
        Connection issue detected. Running in offline mode.
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          float: right;
          cursor: pointer;
          margin-left: 10px;
          opacity: 0.8;
        ">×</button>
      </div>
    `;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification && notification.parentElement) {
        notification.remove();
      }
    }, 5000);
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
      // Show loading state
      if (logoutBtn) {
        logoutBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> <span>Signing out...</span>';
        logoutBtn.disabled = true;
      }

      await supabase.auth.signOut();
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error:", error);

      // Reset button state
      if (logoutBtn) {
        logoutBtn.innerHTML =
          '<i class="fas fa-sign-out-alt"></i> <span>Logout</span>';
        logoutBtn.disabled = false;
      }

      // Handle logout error gracefully
      if (error.message?.includes("Failed to fetch")) {
        // If logout fails due to network, clear local session and redirect anyway
        console.warn("Network issue during logout, clearing local session");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
      } else {
        // Show error notification
        showErrorNotification("Logout failed. Please try again.");
      }
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
