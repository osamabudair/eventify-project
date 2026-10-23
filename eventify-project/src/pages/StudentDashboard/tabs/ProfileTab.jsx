// --- Imports ---
import React, { useState, useEffect, useRef } from 'react';
import { Save, Camera, Eye, EyeOff } from 'lucide-react';
import { updateProfileApi, updateAvatarApi, deleteAvatarApi } from '../../../api/axiosInstance';
import { useToast } from '../../../context/ToastContext';
import PasswordStrengthMeter from '../../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import AvatarPreviewModal from '../../../components/AvatarPreviewModal/AvatarPreviewModal';
import './ProfileTab.css';

const ProfileTab = ({ showToast: propShowToast }) => {
  const { toast } = useToast();
  const showToast = propShowToast || ((msg, type = 'success') => (toast[type] ? toast[type](msg) : toast.info(msg)));

  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [avatarUrl, setAvatarUrl] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar Modal & File Input States
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setProfileData({
        fullName: user.name || user.username || 'Student',
        email: user.email || 'student@university.edu'
      });

      const storedAvatar =
        user.avatarUrl ||
        user.profileImageUrl ||
        user.avatar ||
        user.profilePicture ||
        localStorage.getItem(`avatar_${user.id || user._id || user.email}`);
      if (storedAvatar) {
        setAvatarUrl(storedAvatar);
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageSrc(event.target.result);
      setIsAvatarModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input value so selecting the same image triggers onChange
    e.target.value = '';
  };

  const handleSaveAvatar = async (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
    setIsAvatarModalOpen(false);
    setSelectedImageSrc(null);

    let persistedUrl = newAvatarUrl;
    try {
      const updatedDto = await updateAvatarApi(newAvatarUrl);
      if (updatedDto?.avatarUrl || updatedDto?.profileImageUrl) {
        persistedUrl = updatedDto.avatarUrl || updatedDto.profileImageUrl;
        setAvatarUrl(persistedUrl);
      }
    } catch {
      // Fallback to local state if backend endpoint is temporarily unreachable
    }

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const updatedUser = {
        ...user,
        avatarUrl: persistedUrl,
        profileImageUrl: persistedUrl,
        avatar: persistedUrl,
        profilePicture: persistedUrl
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem(`avatar_${user.id || user._id || user.email}`, persistedUrl);
      window.dispatchEvent(new Event('storage'));
    }

    showToast('Profile picture updated successfully!', 'success');
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl('');
    setIsAvatarModalOpen(false);
    setSelectedImageSrc(null);

    try {
      await deleteAvatarApi();
    } catch {
      // Fallback to local state if backend endpoint is temporarily unreachable
    }

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      user.avatarUrl = null;
      user.profileImageUrl = null;
      user.avatar = null;
      user.profilePicture = null;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem(`avatar_${user.id || user._id || user.email}`);
      window.dispatchEvent(new Event('storage'));
    }

    showToast('Profile photo removed.', 'info');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (passwords.current || passwords.new || passwords.confirm) {
      if (!passwords.current) {
        showToast('Please enter current password to set a new one.', 'error');
        return;
      }
      if (passwords.new !== passwords.confirm) {
        showToast('New passwords do not match!', 'error');
        return;
      }
      if (passwords.new.length < 8) {
        showToast('New password must be at least 8 characters.', 'error');
        return;
      }
    }

    try {
      const payload = {
        name: profileData.fullName,
        currentPassword: passwords.current || null,
        newPassword: passwords.new || null,
        confirmNewPassword: passwords.confirm || null,
        avatarUrl: avatarUrl || null
      };

      const res = await updateProfileApi(payload);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const resolvedAvatar = avatarUrl || user.avatarUrl || user.avatar || user.profilePicture || null;
      const updatedUser = {
        ...user,
        username: profileData.fullName,
        name: profileData.fullName,
        email: profileData.email,
        avatarUrl: resolvedAvatar,
        profileImageUrl: resolvedAvatar,
        avatar: resolvedAvatar,
        profilePicture: resolvedAvatar
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      showToast(res.data.message || 'Profile updated successfully!', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const errMessage = error.response?.data?.message || 'Failed to update profile. Please verify your data.';
      showToast(errMessage, 'error');
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
            {avatarUrl ? (
              <img src={avatarUrl} alt={profileData.fullName} className="avatar-profile-img" />
            ) : (
              <span className="avatar-monogram">{initials}</span>
            )}
            {avatarUrl && (
              <button
                type="button"
                className="avatar-remove-btn"
                onClick={handleRemovePhoto}
                title="Remove photo"
                aria-label="Remove photo"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="avatar-edit-btn"
              title="Change Profile Picture"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
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

          {/* Current Password with visibility toggle */}
          <div className="input-group full-width">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
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

          {/* New Password with visibility toggle and strength meter */}
          <div className="input-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
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

          {/* Confirm New Password with visibility toggle */}
          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
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

      {/* Circular Avatar Preview Modal */}
      <AvatarPreviewModal
        isOpen={isAvatarModalOpen}
        imageSrc={selectedImageSrc}
        onClose={() => {
          setIsAvatarModalOpen(false);
          setSelectedImageSrc(null);
        }}
        onSave={handleSaveAvatar}
      />
    </div>
  );
};

export default ProfileTab;
