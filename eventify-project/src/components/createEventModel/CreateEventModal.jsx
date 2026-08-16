// --- Imports ---
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Users, FileText, Sparkles, Image as ImageIcon, Clock, Upload } from 'lucide-react';
import { createEventApi, updateEventApi } from '../../api/axiosInstance';
import './CreateEventModal.css';

const CreateEventModal = ({ isOpen, onClose, onEventCreated, onEventUpdated, eventData }) => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', startTime: '', endTime: '', location: 'Amman', category: 'Technology', maxAttendees: 100
  });
  
  const [imageFile, setImageFile] = useState(null); 
  const [fileName, setFileName] = useState('No file chosen');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = Boolean(eventData);

  // --- Side Effects (Populate data if Edit Mode) ---
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && eventData) {
        const formattedDate = eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '';
        
        let startTime = '';
        let endTime = '';
        if (eventData.time && eventData.time.includes('-')) {
          const times = eventData.time.split('-');
          startTime = times[0].trim();
          endTime = times[1].trim();
        }

        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          date: formattedDate,
          startTime: startTime,
          endTime: endTime,
          location: eventData.location || 'Amman',
          category: eventData.category || 'Technology',
          maxAttendees: eventData.maxAttendees || 100
        });
        
        setFileName(eventData.image ? 'Current Image Attached' : 'No file chosen');
        setImageFile(null);
      } else {
        setFormData({ title: '', description: '', date: '', startTime: '', endTime: '', location: 'Amman', category: 'Technology', maxAttendees: 100 });
        setFileName('No file chosen');
        setImageFile(null);
      }
      setErrorMsg('');
    }
  }, [isOpen, isEditMode, eventData]);


  // --- Helper Functions ---
  const today = new Date().toISOString().split('T')[0];

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 8; i <= 22; i++) { 
      const hour = i === 12 ? 12 : i % 12;
      const ampm = i >= 12 ? 'PM' : 'AM';
      const formattedHour = hour.toString().padStart(2, '0');
      times.push(`${formattedHour}:00 ${ampm}`);
      times.push(`${formattedHour}:30 ${ampm}`);
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
    } else {
      setImageFile(null);
      setFileName(isEditMode && eventData?.image ? 'Current Image Attached' : 'No file chosen');
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', date: '', startTime: '', endTime: '', location: 'Amman', category: 'Technology', maxAttendees: 100 });
    setImageFile(null);
    setFileName('No file chosen');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setErrorMsg('');
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('date', formData.date);
      
      const formattedTime = `${formData.startTime} - ${formData.endTime}`;
      data.append('time', formattedTime);
      
      data.append('location', formData.location);
      data.append('category', formData.category);
      data.append('maxAttendees', Number(formData.maxAttendees));
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditMode) {
        const targetId = eventData._id || eventData.id;
        const res = await updateEventApi(targetId, data);
        if (onEventUpdated) onEventUpdated(res.data);
      } else {
        const res = await createEventApi(data);
        if (onEventCreated) onEventCreated(res.data);
      }
      
      handleClose();
      if (!isEditMode) {
         window.location.reload(); 
      }
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- Render ---
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header-modern">
          <div className="header-title">
            <Sparkles className="header-icon" size={22} />
            <h3>{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
          </div>
          <button className="close-btn-modern" onClick={handleClose} type="button"><X size={20} /></button>
        </div>
        
        {/* Modal Body */}
        <form className="modal-body-modern" onSubmit={handleSubmit}>
          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <div className="form-row-two-cols">
            <div className="input-group-modern">
              <label><FileText size={16} /> Event Name</label>
              <input type="text" name="title" placeholder="e.g. React Bootcamp" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="input-group-modern">
              <label><ImageIcon size={16} /> Event Image</label>
              <div className="file-upload-wrapper">
                <label htmlFor="file-upload" className="custom-file-button">
                  <Upload size={14} /> Choose File
                </label>
                <span className="file-name-text">{fileName}</span>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />
              </div>
            </div>
          </div>

          <div className="form-row-three-cols">
            <div className="input-group-modern">
              <label><Calendar size={16} /> Date</label>
              <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required />
            </div>
            
            <div className="input-group-modern">
              <label><Clock size={16} /> Start Time</label>
              <select name="startTime" value={formData.startTime} onChange={handleChange} required>
                <option value="" disabled>Select Start Time</option>
                {timeOptions.map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="input-group-modern">
              <label><Clock size={16} /> End Time</label>
              <select name="endTime" value={formData.endTime} onChange={handleChange} required>
                <option value="" disabled>Select End Time</option>
                {timeOptions.map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-three-cols">
            <div className="input-group-modern">
              <label><MapPin size={16} /> Location</label>
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
              <label><Users size={16} /> Capacity</label>
              <input type="number" name="maxAttendees" min="1" value={formData.maxAttendees} onChange={handleChange} required/>
            </div>
          </div>

          <div className="input-group-modern">
            <label><FileText size={16} /> Description</label>
            <textarea name="description" placeholder="Describe what this event is about..." value={formData.description} onChange={handleChange} rows="2" required />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-modern">
            <button type="button" className="cancel-btn-modern" onClick={handleClose}>Cancel</button>
            <button type="submit" className="submit-btn-modern" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Event')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateEventModal;