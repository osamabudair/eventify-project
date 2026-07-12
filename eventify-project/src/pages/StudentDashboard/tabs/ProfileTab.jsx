import React, { useState } from 'react';
import { User, Lock, Save, Camera, Mail, BookOpen, Hash } from 'lucide-react';
import './ProfileTab.css';

const ProfileTab = () => {
  const [profileData, setProfileData] = useState({
    fullName: 'Osama',
    universityId: '202210459',
    email: 'osama@university.edu',
    major: 'Computer Science'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert(`Profile updated successfully for ${profileData.fullName}!`);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // استخراج أول حرفين من الاسم للصورة الرمزية
  const initials = profileData.fullName.substring(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in modern-profile-layout">
      
      {/* العمود الأيسر: البطاقة التعريفية */}
      <div className="profile-sidebar-card">
        <div className="avatar-wrapper">
          {initials}
          <button className="avatar-edit-btn" title="Change Avatar">
            <Camera size={16} />
          </button>
        </div>
        <h2 className="profile-name">{profileData.fullName}</h2>
        <p className="profile-role">Student</p>
        
        <div className="profile-quick-info">
          <div className="info-item">
            <BookOpen size={16} className="info-icon" />
            <span>{profileData.major}</span>
          </div>
          <div className="info-item">
            <Mail size={16} className="info-icon" />
            <span>{profileData.email}</span>
          </div>
          <div className="info-item">
            <Hash size={16} className="info-icon" />
            <span>ID: {profileData.universityId}</span>
          </div>
        </div>
      </div>

      {/* العمود الأيمن: الفورمات */}
      <div className="profile-forms-section">
        
        {/* فورم المعلومات الشخصية */}
        <form className="settings-card modern-form-card" onSubmit={handleSaveProfile}>
          <div className="card-header">
            <h3><User size={20} className="text-primary" /> Personal Information</h3>
            <p className="header-subtitle">Update your personal details and university info.</p>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={profileData.fullName} 
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="input-group">
              <label>University ID</label>
              <input 
                type="text" 
                name="universityId"
                value={profileData.universityId} 
                onChange={handleProfileChange}
                disabled
                className="disabled-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={profileData.email} 
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Major / Department</label>
              <input 
                type="text" 
                name="major"
                value={profileData.major} 
                onChange={handleProfileChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="settings-save-btn">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>

        {/* فورم تغيير كلمة المرور */}
        <form className="settings-card modern-form-card" onSubmit={handleSavePassword}>
          <div className="card-header">
            <h3><Lock size={20} className="text-primary" /> Security & Password</h3>
            <p className="header-subtitle">Ensure your account is using a long, random password to stay secure.</p>
          </div>

          <div className="input-group" style={{ maxWidth: '50%', marginBottom: '20px' }}>
            <label>Current Password</label>
            <input 
              type="password" 
              name="current"
              placeholder="Enter current password" 
              value={passwords.current}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>New Password</label>
              <input 
                type="password" 
                name="new"
                placeholder="••••••••" 
                value={passwords.new}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                name="confirm"
                placeholder="••••••••" 
                value={passwords.confirm}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="settings-save-btn">
              <Lock size={18} /> Update Password
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ProfileTab;