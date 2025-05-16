import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
// Initialize Supabase client
const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);
 
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
 
    if (userError || !user) {
      alert('User not authenticated. Please log in.');
      window.location.href = 'login.html';
      return;
    }
 
    console.log('Authenticated user:', user);
 
    // Fetch profile data
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('*')
      .eq('user_id', user.id)
      .single();
 
    if (profileError || !profileData) {
      console.error('Failed to fetch user profile:', profileError?.message);
      alert('Failed to load user profile.');
      return;
    }
 
    const profile = profileData;
    console.log('User profile:', profile);
 
    // Display profile info
    document.getElementById('name').textContent = profile.name || 'N/A';
    document.getElementById('surname').textContent = profile.surname || 'N/A';
    document.getElementById('email').textContent = profile.email || 'N/A';
    document.getElementById('phone').textContent = profile.phone_number || 'N/A';
 
    // Profile image display
    const profileImg = document.getElementById('profile-img');
    profileImg.src = profile.avatar_url || 'images/default-avatar.png';
 
    // Profile image upload
    const fileInput = document.getElementById('profile-pic-upload');
    const uploadLabel = document.querySelector('.upload-label');
 
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
 
      // Show uploading UI
      uploadLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      uploadLabel.style.pointerEvents = 'none';
 
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
 
      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, file);
 
        if (uploadError) throw uploadError;
 
        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('user-avatars')
          .getPublicUrl(filePath);
 
        if (!publicUrl) throw new Error('Unable to get public URL.');
 
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('signup')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);
 
        if (updateError) throw updateError;
 
        // Update UI
        profileImg.src = publicUrl;
 
        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error('Image upload error:', error.message);
        alert('Failed to upload profile picture. Please try again.');
      } finally {
        uploadLabel.innerHTML = '<i class="fas fa-camera"></i> Change Picture';
        uploadLabel.style.pointerEvents = 'auto';
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    alert('An unexpected error occurred. Please reload the page.');
  }
});