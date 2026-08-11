import React, { useState, useEffect } from 'react';
import { Save, Camera } from 'lucide-react';
import { updateProfileApi } from '../..//../api/axiosInstance';
import './ProfileTab.css';

const ProfileTab = () => {
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setProfileData({
        fullName: user.username || 'Student',
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
      if (passwords.new !== passwords.confirm) {
        alert("New passwords do not match!");
        return;
      }
      if (!passwords.current) {
        alert("Please enter your current password to set a new one.");
        return;
      }
    }

    try {
      const res = await updateProfileApi({
        fullName: profileData.fullName,
        current: passwords.current,
        new: passwords.new
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      window.dispatchEvent(new Event('storage'));

      alert(res.data.message);
      
      setPasswords({ current: '', new: '', confirm: '' });

    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile. Please try again.");
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const initials = profileData.fullName ? profileData.fullName.substring(0, 2).toUpperCase() : 'ST';

  return (
    <div className="animate-fade-in modern-profile-layout">
      <form className="single-profile-card" onSubmit={handleSaveChanges}>
        
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

        <div className="form-grid-compact">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" name="fullName" value={profileData.fullName} 
              onChange={handleChange} required 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" name="email" value={profileData.email} 
              disabled className="disabled-input" 
            />
          </div>

          <div className="input-group full-width">
            <label>Current Password</label>
            <input 
              type="password" name="current" placeholder="Enter current password" 
              value={passwords.current} onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" name="new" placeholder="••••••••" 
              value={passwords.new} onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input 
              type="password" name="confirm" placeholder="••••••••" 
              value={passwords.confirm} onChange={handleChange} 
            />
          </div>
        </div>

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