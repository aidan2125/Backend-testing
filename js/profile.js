// js/profile.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
// Initialize Supabase client — replace with your own keys!
const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);
 
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
 
    if (userError || !user) {
      alert('User not authenticated. Please log in.');
      window.location.href = 'login.html';
      return;
    }
 
    // Fetch profile from 'signup' table using user.id
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('*')
      .eq('user_id', user.id)
      .single();
 
    if (profileError || !profileData) {
      alert('Failed to load profile.');
      return;
    }
 
    const profileID = profileData.profileID;
 
    // Display profile info in read-only spans
    document.getElementById('name').textContent = profileData.name || 'N/A';
    document.getElementById('surname').textContent = profileData.surname || 'N/A';
    document.getElementById('email').textContent = profileData.email || 'N/A';
    document.getElementById('phone').textContent = profileData.phone_number || 'N/A';
 
    // Set profile image (fallback handled by onerror in img tag)
    document.getElementById('profile-img').src = profileData.avatar_url || 'https://ui-avatars.com/api/?name=User';
 
    // Populate edit form inputs
    document.getElementById('edit-name').value = profileData.name || '';
    document.getElementById('edit-surname').value = profileData.surname || '';
    document.getElementById('edit-email').value = profileData.email || '';
    document.getElementById('edit-phone').value = profileData.phone_number || '';
 
    // Handle profile picture upload
    document.getElementById('profile-pic-upload').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
 
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${profileID}_${Date.now()}.${fileExt}`;
 
      try {
        // Upload image to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, file);
 
        if (uploadError) {
          document.getElementById('profile-img').src = profileData.avatar_url || '';          console.error('Full upload error:', uploadError);
          notify('Image upload failed: ' + uploadError.message);
          return;
        }
        console.log('Image uploaded successfully:', uploadData);
 
        // Get public URL of uploaded image (with error handling)
        const { data: publicData, error: publicUrlError } = supabase
          .storage
          .from('user-avatars')
          .getPublicUrl(filePath);
 
        if (publicUrlError) {
          console.error('Failed to get public URL:', publicUrlError.message);
          alert('Public URL error. Check console.');
          return;
        }
 
        console.log('Public URL:', publicData.publicUrl);
        const avatarUrl = publicData.publicUrl;
 
        // Add this log before updating the avatar_url in the database
        console.log('Updating profile with avatar_url:', avatarUrl, 'for profileID:', profileID);
 
        const { error: updateError } = await supabase
          .from('signup')
          .update({ avatar_url: avatarUrl })
          .eq('profileID', profileID);
 
        if (updateError) {
          console.error('Error updating avatar_url in signup table:', updateError.message);
          alert('Failed to update avatar in database. See console.');
          return;
        }
 
        // Update profile image on page
        document.getElementById('profile-img').src = avatarUrl;
        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error.message);
        alert('Error uploading image. Please try again.');
      }
    });
 
    // Handle profile save button click
    document.getElementById('save-profile-btn').addEventListener('click', async () => {
      const updatedProfile = {
        name: document.getElementById('edit-name').value.trim(),
        surname: document.getElementById('edit-surname').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        phone_number: document.getElementById('edit-phone').value.trim(),
      };
 
      try {
        const { error: updateError } = await supabase
          .from('signup')
          .update(updatedProfile)
          .eq('profileID', profileID);
 
        if (updateError) throw updateError;
 
        // Update displayed profile info
        document.getElementById('name').textContent = updatedProfile.name || 'N/A';
        document.getElementById('surname').textContent = updatedProfile.surname || 'N/A';
        document.getElementById('email').textContent = updatedProfile.email || 'N/A';
        document.getElementById('phone').textContent = updatedProfile.phone_number || 'N/A';
 
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error.message);
        alert('Failed to update profile. Please try again.');
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    alert('Unexpected error occurred. Please reload the page.');
  }
});
 