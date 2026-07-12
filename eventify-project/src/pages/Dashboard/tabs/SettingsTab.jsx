import React from 'react';
import { User, Lock } from 'lucide-react';
import './SettingsTab.css';

const SettingsTab = () => {
  return (
    <div className="animate-fade-in settings-grid">
      <div className="settings-card">
        <h3><User size={20} className="text-primary" /> Club Profile</h3>
        <div className="form-row">
          <div className="input-group">
            <label>Club Name</label>
            <input type="text" defaultValue="Tech Club" />
          </div>
          <div className="input-group">
            <label>Contact Email</label>
            <input type="email" defaultValue="contact@techclub.edu" />
          </div>
        </div>
        <div className="input-group">
          <label>Club Description</label>
          <textarea rows="3" defaultValue="We focus on organizing technical workshops and bootcamps for university students."></textarea>
        </div>
      </div>

      <div className="settings-card">
        <h3><Lock size={20} className="text-primary" /> Security</h3>
        <div className="form-row">
          <div className="input-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
        </div>
        <button className="settings-save-btn" onClick={() => alert('Settings Saved!')}>Save Changes</button>
      </div>
    </div>
  );
};

export default SettingsTab;