// --- Imports ---
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, MapPin, Tag, Users, FileText, Sparkles, Image as ImageIcon, Clock, Upload } from 'lucide-react';
import { createEventApi, updateEventApi, getEventByIdApi } from '../../api/axiosInstance';
import './CreateEventModal.css';

const normalizeDateForInput = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (dateVal.includes('-')) {
      const parts = dateVal.split('-');
      if (parts[0].length === 4) {
        return dateVal.split('T')[0];
      } else if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return -1;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : '';

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const normalizeTimeForSelect = (timeStr) => {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  let minutes = match[2].padStart(2, '0');
  let modifier = match[3] ? match[3].toUpperCase() : '';

  if (!modifier) {
    modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  return `${String(hours).padStart(2, '0')}:${minutes} ${modifier}`;
};

const CreateEventModal = ({ isOpen, onClose, onEventCreated, onEventUpdated, eventData, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: 'Amman',
    category: 'Technology',
    maxAttendees: 100
  });

  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = Boolean(eventData);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const allTimeOptions = useMemo(() => {
  const list = [];
  const now = new Date();
  const isSelectedToday = formData.date === todayStr;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let h = 8; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const slotMinutes = h * 60 + m;

      if (isSelectedToday && slotMinutes <= currentMinutes + 30) {
        continue;
      }

      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      list.push(`${String(hour12).padStart(2, '0')}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return list;
}, [formData.date, todayStr]);

  const filteredEndTimeOptions = useMemo(() => {
    if (!formData.startTime) return allTimeOptions;
    const startMins = timeToMinutes(formData.startTime);
    return allTimeOptions.filter(t => timeToMinutes(t) > startMins);
  }, [formData.startTime, allTimeOptions]);

  useEffect(() => {
    if (!isOpen) return;

    const populate = async () => {
      if (isEditMode && eventData) {
        let fullEvent = eventData;
        const targetId = eventData._id || eventData.id;

        if (!eventData.description && targetId) {
          try {
            const res = await getEventByIdApi(targetId);
            if (res.data) fullEvent = res.data;
          } catch (err) {
            console.error("Error loading description:", err);
          }
        }

        const formattedDate = normalizeDateForInput(fullEvent.date);
        const normalizedStart = normalizeTimeForSelect(fullEvent.startTime);
        const normalizedEnd = normalizeTimeForSelect(fullEvent.endTime);
        const imgUrl = fullEvent.imageUrl || fullEvent.image || '';

        setFormData({
          title: fullEvent.name || fullEvent.title || '',
          description: fullEvent.description || '',
          date: formattedDate,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          location: fullEvent.location || 'Amman',
          category: fullEvent.category || 'Technology',
          maxAttendees: fullEvent.capacity || fullEvent.maxAttendees || 100
        });

        setPreviewImage(imgUrl);
        setFileName(imgUrl ? 'Current Image Attached' : 'No file chosen');
        setImageFile(null);
      } else {
        setFormData({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          location: 'Amman',
          category: 'Technology',
          maxAttendees: 100
        });
        setFileName('No file chosen');
        setImageFile(null);
        setPreviewImage('');
      }
      setErrorMsg('');
    };

    populate();
  }, [isOpen, isEditMode, eventData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startTime') {
      const newStartMins = timeToMinutes(value);
      const currentEndMins = timeToMinutes(formData.endTime);
      if (currentEndMins <= newStartMins) {
        setFormData(prev => ({ ...prev, startTime: value, endTime: '' }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime)) {
      setErrorMsg("End time must be after the start time.");
      setLoading(false);
      return;
    }

    try {
      let finalImageUrl = previewImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000";
      if (imageFile) {
        finalImageUrl = await fileToBase64(imageFile);
      }

      const payload = {
        name: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        category: formData.category,
        capacity: Number(formData.maxAttendees),
        imageUrl: finalImageUrl
      };

      if (isEditMode) {
        const targetId = eventData._id || eventData.id;
        const res = await updateEventApi(targetId, payload);
        if (showToast) showToast(`"${formData.title}" updated successfully!`, 'success');
        if (onEventUpdated) onEventUpdated(res.data);
      } else {
        const res = await createEventApi(payload);
        if (showToast) showToast(`Event "${formData.title}" created successfully!`, 'success');
        if (onEventCreated) onEventCreated(res.data);
      }

      handleClose();
    } catch (err) {
      const backendError = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      setErrorMsg(backendError || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-modern">
          <div className="header-title">
            <Sparkles className="header-icon" size={22} />
            <h3>{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
          </div>
          <button className="close-btn-modern" onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form className="modal-body-modern" onSubmit={handleSubmit}>
          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <div className="form-row-two-cols">
            <div className="input-group-modern">
              <label><FileText size={16} /> Event Name</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Spring Boot Workshop"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group-modern">
              <label><ImageIcon size={16} /> Event Image</label>
              <div className="file-upload-wrapper">
                <label htmlFor="file-upload" className="custom-file-button">
                  <Upload size={14} /> Choose File
                </label>
                <span className="file-name-text">{fileName}</span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>
          </div>

          <div className="form-row-three-cols">
            <div className="input-group-modern">
              <label><Calendar size={16} /> Date</label>
              <input
                type="date"
                name="date"
                min={todayStr}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group-modern">
              <label><Clock size={16} /> Start Time</label>
              <select name="startTime" value={formData.startTime} onChange={handleChange} required>
                <option value="" disabled>Select Start Time</option>
                {allTimeOptions.map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="input-group-modern">
              <label><Clock size={16} /> End Time</label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={!formData.startTime}
                required
              >
                <option value="" disabled>
                  {formData.startTime ? "Select End Time" : "Choose Start Time First"}
                </option>
                {filteredEndTimeOptions.map((time, index) => (
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
              <input
                type="number"
                name="maxAttendees"
                min="1"
                value={formData.maxAttendees}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group-modern">
            <label><FileText size={16} /> Description</label>
            <textarea
              name="description"
              placeholder="Describe what this event is about..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="modal-actions-modern">
            <button type="button" className="cancel-btn-modern" onClick={handleClose}>
              Cancel
            </button>
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