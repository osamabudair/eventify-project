// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Save, Camera, Eye, EyeOff } from 'lucide-react';
import { updateProfileApi } from '../../../api/axiosInstance';
import PasswordStrengthMeter from '../../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import './ProfileTab.css';

const ProfileTab = ({ showToast }) => {
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });


  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setProfileData({
        fullName: user.name || user.username || 'Student',
        email: user.email || 'student@university.edu'
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in profileData) {
      setProfileData({ ...profileData, [name]: value });
    } else {
      setPasswords({ ...passwords, [name]: value });
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (passwords.current || passwords.new || passwords.confirm) {
      if (!passwords.current) {
        if (showToast) showToast("Please enter current password to set a new one.", "error");
        return;
      }
      if (passwords.new !== passwords.confirm) {
        if (showToast) showToast("New passwords do not match!", "error");
        return;
      }
      if (passwords.new.length < 8) {
        if (showToast) showToast("New password must be at least 8 characters.", "error");
        return;
      }
    }

    try {
      const payload = {
        name: profileData.fullName,
        currentPassword: passwords.current || null,
        newPassword: passwords.new || null,
        confirmNewPassword: passwords.confirm || null
      };

      const res = await updateProfileApi(payload);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        username: profileData.fullName,
        name: profileData.fullName,
        email: profileData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      if (showToast) {
        showToast(res.data.message || "Profile updated successfully!", "success");
      }

      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const errMessage = error.response?.data?.message || "Failed to update profile. Please verify your data.";
      if (showToast) {
        showToast(errMessage, "error");
      }
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const initials = profileData.fullName ? profileData.fullName.substring(0, 2).toUpperCase() : 'ST';

  return (
    <div className="animate-fade-in modern-profile-layout">
      <form className="single-profile-card" onSubmit={handleSaveChanges}>
        
        {/* Profile Header */}
        <div className="profile-header-compact">
          <div className="avatar-wrapper">
            {initials}
            <button className="avatar-edit-btn" title="Change Avatar" type="button">
              <Camera size={16} />
            </button>
          </div>
          <div className="profile-titles">
            <h2>{profileData.fullName}</h2>
            <p>{profileData.email}</p>
          </div>
        </div>

        <hr className="form-divider" />

        {/* Profile Form */}
        <div className="form-grid-compact">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={profileData.fullName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={profileData.email} 
              disabled 
              className="disabled-input" 
            />
          </div>

          {/* Current Password مع العين */}
          <div className="input-group full-width">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                name="current" 
                placeholder="Enter current password" 
                value={passwords.current} 
                onChange={handleChange} 
              />
              <button 
                type="button" 
                className="eye-toggle-btn"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password مع العين و PasswordStrengthMeter */}
          <div className="input-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showNewPassword ? "text" : "password"} 
                name="new" 
                placeholder="••••••••" 
                value={passwords.new} 
                onChange={handleChange} 
              />
              <button 
                type="button" 
                className="eye-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwords.new && <PasswordStrengthMeter password={passwords.new} />}
          </div>

          {/* Confirm New Password مع العين */}
          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirm" 
                placeholder="••••••••" 
                value={passwords.confirm} 
                onChange={handleChange} 
              />
              <button 
                type="button" 
                className="eye-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="settings-save-btn">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;