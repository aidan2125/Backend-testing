
// Global variables
let currentUser = null;
let currentProfile = null;
let isEditMode = false;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Profile page initializing...");

  // Show loading
  showLoading();

  try {
    // Initialize profile
    await initializeProfile();

    // Setup event listeners
    setupEventListeners();

    // Load additional data
    await loadProfileStats();

    console.log("✅ Profile page initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing profile:", error);
    showToast("Failed to load profile", "error");

    // Redirect to login if authentication fails
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } finally {
    // Hide loading after delay for smooth UX
    setTimeout(() => {
      hideLoading();
    }, 1000);
  }
});

// Initialize profile data
async function initializeProfile() {
  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    currentUser = user;

    // Fetch profile from 'signup' table
    const { data: profileData, error: profileError } = await supabase
      .from("signup")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      throw new Error("Failed to load profile data");
    }

    currentProfile = profileData;

    // Display profile information
    displayProfileData(profileData);

    // Update profile image
    updateProfileImage(profileData.avatar_url);
  } catch (error) {
    console.error("❌ Profile initialization error:", error);
    throw error;
  }
}

// Display profile data in the interface
function displayProfileData(profile) {
  try {
    // Header information
    document.getElementById("profileDisplayName").textContent =
      `${profile.name || "Unknown"} ${profile.surname || ""}`.trim();
    document.getElementById("profileDisplayEmail").textContent =
      profile.email || "No email provided";

    // Personal information
    document.getElementById("displayFirstName").textContent =
      profile.name || "Not specified";
    document.getElementById("displayLastName").textContent =
      profile.surname || "Not specified";
    document.getElementById("displayDateOfBirth").textContent =
      profile.date_of_birth || "Not specified";
    document.getElementById("displayGender").textContent =
      profile.gender || "Not specified";

    // Contact information
    document.getElementById("displayEmail").textContent =
      profile.email || "Not specified";
    document.getElementById("displayPhone").textContent =
      profile.phone_number || "Not specified";
    document.getElementById("displayAddress").textContent =
      profile.address || "Not specified";
    document.getElementById("displayCity").textContent =
      profile.city || "Not specified";

    // Travel preferences
    document.getElementById("displayDestinations").textContent =
      profile.preferred_destinations || "Not specified";
    document.getElementById("displayTravelStyle").textContent =
      formatTravelStyle(profile.travel_style);
    document.getElementById("displayBudgetRange").textContent =
      formatBudgetRange(profile.budget_range);
    document.getElementById("displayLanguages").textContent =
      profile.languages || "Not specified";

    // Populate edit forms
    populateEditForms(profile);

    // Update member since badge
    updateMemberSinceBadge(profile.created_at);
  } catch (error) {
    console.error("❌ Error displaying profile data:", error);
    showToast("Error displaying profile information", "error");
  }
}

// Populate edit form fields
function populateEditForms(profile) {
  try {
    // Personal information
    document.getElementById("editFirstName").value = profile.name || "";
    document.getElementById("editLastName").value = profile.surname || "";
    document.getElementById("editDateOfBirth").value =
      profile.date_of_birth || "";
    document.getElementById("editGender").value = profile.gender || "";

    // Contact information
    document.getElementById("editEmail").value = profile.email || "";
    document.getElementById("editPhone").value = profile.phone_number || "";
    document.getElementById("editAddress").value = profile.address || "";
    document.getElementById("editCity").value = profile.city || "";

    // Travel preferences
    document.getElementById("editDestinations").value =
      profile.preferred_destinations || "";
    document.getElementById("editTravelStyle").value =
      profile.travel_style || "";
    document.getElementById("editBudgetRange").value =
      profile.budget_range || "";
    document.getElementById("editLanguages").value = profile.languages || "";
  } catch (error) {
    console.error("❌ Error populating edit forms:", error);
  }
}

// Update profile image
function updateProfileImage(avatarUrl) {
  const profileImg = document.getElementById("profile-img");
  if (profileImg) {
    if (avatarUrl) {
      profileImg.src = avatarUrl;
    } else {
      // Generate initials-based avatar
      const initials = getInitials(
        currentProfile?.name,
        currentProfile?.surname,
      );
      profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ff6b35&color=ffffff&size=200`;
    }
  }
}

// Get initials from name
function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${first}${last}` || "U";
}

// Update member since badge
function updateMemberSinceBadge(createdAt) {
  const memberSinceBadge = document.getElementById("memberSince");
  if (memberSinceBadge && createdAt) {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    memberSinceBadge.innerHTML = `
      <i class="fas fa-calendar"></i>
      Member since ${year}
    `;
  }
}

// Load profile statistics
async function loadProfileStats() {
  try {
    const profileID = currentProfile?.profileID;
    if (!profileID) return;

    // Load trips count
    const { data: trips, error: tripsError } = await supabase
      .from("trip_planner")
      .select("id")
      .eq("profileID", profileID);

    if (!tripsError && trips) {
      document.getElementById("tripsCount").textContent = trips.length;
    }

    // Load total expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("trip_expenses")
      .select("amount")
      .eq("profileID", profileID);

    if (!expensesError && expenses) {
      const totalSpent = expenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0,
      );
      document.getElementById("totalSpent").textContent =
        `R${totalSpent.toFixed(0)}`;
    }

    // Estimate countries visited (simplified calculation)
    const uniqueDestinations = new Set();
    if (!tripsError && trips) {
      // This is a simplified calculation - in a real app, you'd have proper country detection
      const countriesCount = Math.min(trips.length, 10); // Max 10 for demo
      document.getElementById("countriesVisited").textContent = countriesCount;
    }
  } catch (error) {
    console.error("❌ Error loading profile stats:", error);
  }
}

// Setup event listeners
function setupEventListeners() {
  try {
    // Profile picture upload
    const profilePicUpload = document.getElementById("profile-pic-upload");
    if (profilePicUpload) {
      profilePicUpload.addEventListener("change", handleProfilePictureUpload);
    }

    // Edit section buttons
    document.querySelectorAll(".edit-section-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const section = e.target.closest(".edit-section-btn").dataset.section;
        toggleEditMode(section);
      });
    });

    // Account action buttons
    const exportBtn = document.getElementById("exportDataBtn");
    const privacyBtn = document.getElementById("privacyBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const deleteBtn = document.getElementById("deleteAccountBtn");

    if (exportBtn) exportBtn.addEventListener("click", handleExportData);
    if (privacyBtn) privacyBtn.addEventListener("click", handlePrivacySettings);
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    if (deleteBtn) deleteBtn.addEventListener("click", handleDeleteAccount);

    console.log("✅ Event listeners setup complete");
  } catch (error) {
    console.error("❌ Error setting up event listeners:", error);
  }
}

// Handle profile picture upload
async function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showToast("Image size must be less than 5MB", "error");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    showToast(
      "Please upload a valid image file (JPG, PNG, GIF, WebP)",
      "error",
    );
    return;
  }

  try {
    // Show upload progress
    showUploadProgress();

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${currentProfile.profileID}_${Date.now()}.${fileExt}`;

    // Simulate progress for better UX
    updateUploadProgress(25);

    // Upload image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    updateUploadProgress(75);

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(filePath);

    const avatarUrl = publicData.publicUrl;

    updateUploadProgress(90);

    // Update database
    const { error: updateError } = await supabase
      .from("signup")
      .update({ avatar_url: avatarUrl })
      .eq("profileID", currentProfile.profileID);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    updateUploadProgress(100);

    // Update UI
    updateProfileImage(avatarUrl);
    currentProfile.avatar_url = avatarUrl;

    setTimeout(() => {
      hideUploadProgress();
      showToast("Profile picture updated successfully!", "success");
    }, 500);
  } catch (error) {
    console.error("❌ Profile picture upload error:", error);
    hideUploadProgress();
    showToast(`Upload failed: ${error.message}`, "error");

    // Reset file input
    event.target.value = "";
  }
}

// Upload progress functions
function showUploadProgress() {
  const progress = document.getElementById("uploadProgress");
  if (progress) {
    progress.classList.add("active");
    updateUploadProgress(0);
  }
}

function updateUploadProgress(percent) {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

  if (progressText) {
    if (percent === 100) {
      progressText.textContent = "Upload complete!";
    } else {
      progressText.textContent = `Uploading... ${percent}%`;
    }
  }
}

function hideUploadProgress() {
  const progress = document.getElementById("uploadProgress");
  if (progress) {
    progress.classList.remove("active");
  }
}

// Toggle edit mode for sections
function toggleEditMode(section) {
  const viewMode = document.getElementById(`${section}ViewMode`);
  const editMode = document.getElementById(`${section}EditMode`);

  if (viewMode && editMode) {
    if (editMode.style.display === "none") {
      // Enter edit mode
      viewMode.style.display = "none";
      editMode.style.display = "block";
      editMode.classList.add("active");
    } else {
      // Exit edit mode
      cancelEdit(section);
    }
  }
}

// Cancel edit mode
window.cancelEdit = function (section) {
  const viewMode = document.getElementById(`${section}ViewMode`);
  const editMode = document.getElementById(`${section}EditMode`);

  if (viewMode && editMode) {
    viewMode.style.display = "block";
    editMode.style.display = "none";
    editMode.classList.remove("active");

    // Reset form values
    populateEditForms(currentProfile);
  }
};

// Save section changes
window.saveSection = async function (section) {
  try {
    showToast("Saving changes...", "info");

    let updateData = {};

    // Collect data based on section
    switch (section) {
      case "personal":
        updateData = {
          name: document.getElementById("editFirstName").value.trim(),
          surname: document.getElementById("editLastName").value.trim(),
          date_of_birth:
            document.getElementById("editDateOfBirth").value || null,
          gender: document.getElementById("editGender").value || null,
        };
        break;

      case "contact":
        updateData = {
          email: document.getElementById("editEmail").value.trim(),
          phone_number: document.getElementById("editPhone").value.trim(),
          address: document.getElementById("editAddress").value.trim(),
          city: document.getElementById("editCity").value.trim(),
        };
        break;

      case "travel":
        updateData = {
          preferred_destinations: document
            .getElementById("editDestinations")
            .value.trim(),
          travel_style:
            document.getElementById("editTravelStyle").value || null,
          budget_range:
            document.getElementById("editBudgetRange").value || null,
          languages: document.getElementById("editLanguages").value.trim(),
        };
        break;

      case "security":
        await handleSecurityUpdate();
        return;

      default:
        throw new Error("Unknown section");
    }

    // Update database
    const { error: updateError } = await supabase
      .from("signup")
      .update(updateData)
      .eq("profileID", currentProfile.profileID);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    // Update local profile data
    Object.assign(currentProfile, updateData);

    // Refresh display
    displayProfileData(currentProfile);

    // Exit edit mode
    cancelEdit(section);

    showToast("Changes saved successfully!", "success");
  } catch (error) {
    console.error("❌ Save section error:", error);
    showToast(`Save failed: ${error.message}`, "error");
  }
};

// Handle security updates
async function handleSecurityUpdate() {
  try {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All password fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New passwords do not match");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    // Update password using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }

    // Clear form
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    cancelEdit("security");
    showToast("Password updated successfully!", "success");
  } catch (error) {
    console.error("❌ Security update error:", error);
    showToast(`Security update failed: ${error.message}`, "error");
  }
}

// Format travel style display
function formatTravelStyle(style) {
  const styles = {
    budget: "Budget Traveler",
    comfort: "Comfort Seeker",
    luxury: "Luxury Traveler",
    adventure: "Adventure Seeker",
    cultural: "Cultural Explorer",
  };
  return styles[style] || "Not specified";
}

// Format budget range display
function formatBudgetRange(range) {
  const ranges = {
    "under-5000": "Under R5,000",
    "5000-15000": "R5,000 - R15,000",
    "15000-30000": "R15,000 - R30,000",
    "over-30000": "Over R30,000",
  };
  return ranges[range] || "Not specified";
}

// Account action handlers
async function handleExportData() {
  try {
    showToast("Preparing data export...", "info");

    // Fetch all user data
    const profileID = currentProfile.profileID;

    const [trips, expenses, notes, packingList] = await Promise.all([
      supabase.from("trip_planner").select("*").eq("profileID", profileID),
      supabase.from("trip_expenses").select("*").eq("profileID", profileID),
      supabase.from("trip_notes").select("*").eq("profileID", profileID),
      supabase.from("packing_list").select("*").eq("profileID", profileID),
    ]);

    const exportData = {
      profile: currentProfile,
      trips: trips.data || [],
      expenses: expenses.data || [],
      notes: notes.data || [],
      packingList: packingList.data || [],
      exportDate: new Date().toISOString(),
    };

    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `travique-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    showToast("Data exported successfully!", "success");
  } catch (error) {
    console.error("❌ Export data error:", error);
    showToast("Failed to export data", "error");
  }
}

function handlePrivacySettings() {
  showToast("Privacy settings coming soon...", "info");
  // This would open a privacy settings modal in a real implementation
}

async function handleLogout() {
  showConfirmModal(
    "Sign Out",
    "Are you sure you want to sign out of your account?",
    async () => {
      try {
        showToast("Signing out...", "info");

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw new Error(error.message);
        }

        // Clear local storage
        localStorage.clear();

        // Redirect to login
        window.location.href = "login.html";
      } catch (error) {
        console.error("❌ Logout error:", error);
        showToast("Failed to sign out", "error");
      }
    },
  );
}

function handleDeleteAccount() {
  showConfirmModal(
    "Delete Account",
    "Are you sure you want to permanently delete your account? This action cannot be undone.",
    async () => {
      try {
        showToast("Deleting account...", "info");

        // In a real implementation, you would:
        // 1. Delete all user data from database
        // 2. Delete user from Supabase Auth
        // 3. Clean up any uploaded files

        showToast("Account deletion is not implemented yet", "error");
      } catch (error) {
        console.error("❌ Delete account error:", error);
        showToast("Failed to delete account", "error");
      }
    },
  );
}

// Modal functions
function showConfirmModal(title, message, confirmCallback) {
  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("confirmBtn");

  if (modal && modalTitle && modalMessage && confirmBtn) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new listener
    newConfirmBtn.addEventListener("click", () => {
      closeModal();
      confirmCallback();
    });

    modal.classList.add("active");
  }
}

window.closeModal = function () {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.remove("active");
  }
};

// Utility functions
function showLoading() {
  const loading = document.getElementById("loadingOverlay");
  if (loading) {
    loading.classList.add("active");
  }
}

function hideLoading() {
  const loading = document.getElementById("loadingOverlay");
  if (loading) {
    loading.classList.remove("active");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === "error" ? "exclamation-circle" : type === "success" ? "check-circle" : "info-circle"}"></i>
    <span>${message}</span>
  `;

  const container = document.getElementById("toastContainer");
  if (container) {
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("active"), 100);
    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Handle clicks outside modals
document.addEventListener("click", (e) => {
  const modal = document.getElementById("confirmModal");
  if (modal && e.target === modal) {
    closeModal();
  }
});

console.log("✅ Profile JavaScript loaded successfully");
