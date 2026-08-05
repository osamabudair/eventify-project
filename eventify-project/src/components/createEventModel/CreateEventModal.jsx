import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Users, FileText, Sparkles } from 'lucide-react';
import { createEventApi } from '../../api/axiosInstance';
import './CreateEventModal.css';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: 'Amman', category: 'Technology', maxAttendees: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // الحصول على تاريخ اليوم بصيغة YYYY-MM-DD لمنع التواريخ القديمة
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg('');
    try {
      const res = await createEventApi({ ...formData, maxAttendees: Number(formData.maxAttendees) });
      setFormData({ title: '', description: '', date: '', location: 'Amman', category: 'Technology', maxAttendees: 100 });
      if (onEventCreated) onEventCreated(res.data);
      onClose();
      window.location.reload(); 
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-modern">
          <div className="header-title"><Sparkles className="header-icon" size={22} /><h3>Create New Event</h3></div>
          <button className="close-btn-modern" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        
        <form className="modal-body-modern" onSubmit={handleSubmit}>
          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <div className="input-group-modern">
            <label><FileText size={16} /> Event Name</label>
            <input type="text" name="title" placeholder="e.g. React & Node.js Bootcamp" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="input-group-modern">
            <label><FileText size={16} /> Description</label>
            <textarea name="description" placeholder="Describe what this event is about..." value={formData.description} onChange={handleChange} rows="3" required />
          </div>

          <div className="form-row-two-cols">
            <div className="input-group-modern">
              <label><Calendar size={16} /> Date</label>
              {/* خاصية min تمنع اختيار تاريخ قبل اليوم */}
              <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
            </div>

            <div className="input-group-modern">
              <label><MapPin size={16} /> Location</label>
              {/* قائمة محافظات الأردن */}
              <select name="location" value={formData.location} onChange={handleChange} required>
                <option value="Amman">Amman</option>
                <option value="Irbid">Irbid</option>
                <option value="Zarqa">Zarqa</option>
                <option value="Aqaba">Aqaba</option>
                <option value="Madaba">Madaba</option>
                <option value="Jerash">Jerash</option>
                <option value="Ajloun">Ajloun</option>
                <option value="Balqa">Balqa</option>
                <option value="Mafraq">Mafraq</option>
                <option value="Karak">Karak</option>
                <option value="Tafilah">Tafilah</option>
                <option value="Ma'an">Ma'an</option>
              </select>
            </div>
          </div>

          <div className="form-row-two-cols">
            <div className="input-group-modern">
              <label><Tag size={16} /> Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Sports">Sports</option>
                <option value="Art">Art</option>
                <option value="Science">Science</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Volunteering">Volunteering</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group-modern">
              <label><Users size={16} /> Max Capacity</label>
              <input type="number" name="maxAttendees" min="1" value={formData.maxAttendees} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-actions-modern">
            <button type="button" className="cancel-btn-modern" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn-modern" disabled={loading}>{loading ? 'Creating...' : 'Save Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;