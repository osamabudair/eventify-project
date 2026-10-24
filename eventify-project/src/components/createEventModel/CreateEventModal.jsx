import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Users, FileText, CalendarPlus, CalendarCheck, Image as ImageIcon, Upload } from 'lucide-react';
import CustomTimePicker, { timeToMinutes, addOneHour } from './CustomTimePicker';
import { createEventApi, updateEventApi, getEventByIdApi } from '../../api/axiosInstance';
import './CreateEventModal.css';

export const CATEGORIES = [
  'Technology',
  'Business',
  'Sports',
  'Art',
  'Science',
  'Entertainment',
  'Volunteering',
  'Health',
  'Other'
];

export const LOCATIONS = [
  'Amman',
  'Irbid',
  'Zarqa',
  'Aqaba',
  'Madaba',
  'Jerash',
  'Ajloun',
  'Balqa',
  'Mafraq',
  'Karak',
  'Tafilah',
  "Ma'an"
];

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: 'Amman',
  category: 'Technology',
  maxAttendees: 100
};

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

const normalizeTime = (timeStr) => {
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

const CreateEventModal = ({
  isOpen,
  onClose,
  onEventCreated,
  onEventUpdated,
  eventData,
  showToast
}) => {
  const isEditMode = Boolean(eventData);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && eventData) {
      let isSubscribed = true;

      const populateEditData = async () => {
        let fullEvent = eventData;
        const targetId = eventData._id || eventData.id;

        if (!eventData.description && targetId) {
          try {
            const res = await getEventByIdApi(targetId);
            if (res.data) fullEvent = res.data;
          } catch (err) {
            void err;
          }
        }

        if (!isSubscribed) return;

        const formattedDate = normalizeDateForInput(fullEvent.date);
        const normalizedStart = normalizeTime(fullEvent.startTime);
        const normalizedEnd = normalizeTime(fullEvent.endTime);
        const imgUrl = fullEvent.imageUrl || fullEvent.image || '';

        const matchedCategory =
          CATEGORIES.find((c) => c.toLowerCase() === (fullEvent.category || '').toLowerCase()) ||
          'Technology';

        setFormData({
          title: fullEvent.name || fullEvent.title || '',
          description: fullEvent.description || '',
          date: formattedDate,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          location: fullEvent.location || 'Amman',
          category: matchedCategory,
          maxAttendees: Number(fullEvent.capacity ?? fullEvent.maxAttendees ?? 100)
        });

        setPreviewImage(imgUrl);
        setFileName(imgUrl ? 'Current Image Attached' : 'No file chosen');
        setImageFile(null);
        setErrorMsg('');
      };

      populateEditData();

      return () => {
        isSubscribed = false;
      };
    }
  }, [isOpen, isEditMode, eventData]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setImageFile(null);
    setFileName('No file chosen');
    setPreviewImage('');
    setErrorMsg('');
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStartTimeChange = useCallback((newStart) => {
    setFormData((prev) => {
      const startMins = timeToMinutes(newStart);
      const currentEndMins = timeToMinutes(prev.endTime);

      let nextEnd = prev.endTime;
      if (!prev.endTime || currentEndMins <= startMins) {
        nextEnd = addOneHour(newStart);
      }

      return {
        ...prev,
        startTime: newStart,
        endTime: nextEnd
      };
    });
  }, []);

  const handleEndTimeChange = useCallback((newEnd) => {
    setFormData((prev) => ({ ...prev, endTime: newEnd }));
  }, []);

  const handleCategorySelect = useCallback((cat) => {
    setFormData((prev) => ({ ...prev, category: cat }));
  }, []);

  const handleCapacityStep = useCallback((step) => {
    setFormData((prev) => {
      const current = Number(prev.maxAttendees) || 0;
      const nextVal = Math.max(1, current + step);
      return { ...prev, maxAttendees: nextVal };
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
      setPreviewImage(URL.createObjectURL(file));
    }
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

    const startMins = timeToMinutes(formData.startTime);
    const endMins = timeToMinutes(formData.endTime);

    if (endMins <= startMins) {
      setErrorMsg('End time must be strictly after the start time.');
      setLoading(false);
      return;
    }

    try {
      let finalImageUrl =
        previewImage ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
      if (imageFile) {
        finalImageUrl = await fileToBase64(imageFile);
      }

      const payload = {
        name: formData.title.trim(),
        description: formData.description.trim(),
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
      const backendError =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null);
      setErrorMsg(backendError || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-modern">
          <div className="header-title">
            {isEditMode ? (
              <CalendarCheck className="header-icon" size={20} />
            ) : (
              <CalendarPlus className="header-icon" size={20} />
            )}
            <h3>{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
          </div>
          <button className="close-btn-modern" onClick={handleClose} type="button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form className="modal-body-modern" onSubmit={handleSubmit}>
          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          {/* Row 1: Name & Image Upload */}
          <div className="form-grid-two">
            <div className="input-group-modern">
              <label><FileText size={15} /> Event Name</label>
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
              <label><ImageIcon size={15} /> Event Image</label>
              <div className="custom-file-upload-bar">
                <label htmlFor="modal-image-input" className="file-upload-btn">
                  <Upload size={14} /> Choose File
                </label>
                <span className="file-name-display">{fileName}</span>
                <input
                  id="modal-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Date & Capacity */}
          <div className="form-grid-two form-grid-paired">
            <div className="input-group-modern">
              <label><Calendar size={15} /> Date</label>
              <input
                type="date"
                name="date"
                min={todayStr}
                value={formData.date}
                onChange={handleChange}
                className="event-input-date"
                required
              />
            </div>

            <div className="input-group-modern">
              <label><Users size={15} /> Capacity</label>
              <div className="capacity-stepper-box">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleCapacityStep(-10)}
                  aria-label="Decrease capacity"
                >
                  -
                </button>
                <input
                  type="number"
                  name="maxAttendees"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  className="capacity-number-input"
                  required
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleCapacityStep(10)}
                  aria-label="Increase capacity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Start Time & End Time */}
          <div className="form-grid-two form-grid-paired">
            <div className="input-group-modern">
              <label><Clock size={15} /> Start Time</label>
              <CustomTimePicker
                value={formData.startTime}
                onChange={handleStartTimeChange}
                placeholder="Select Start Time"
                required
              />
            </div>

            <div className="input-group-modern">
              <label><Clock size={15} /> End Time</label>
              <CustomTimePicker
                value={formData.endTime}
                minTime={formData.startTime}
                onChange={handleEndTimeChange}
                placeholder="Select End Time"
                disabled={!formData.startTime}
                required
              />
            </div>
          </div>

          {/* Row 4: Location */}
          <div className="input-group-modern">
            <label><MapPin size={15} /> Location</label>
            <div className="select-wrapper-modern">
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="event-select-location"
                required
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Category Pills */}
          <div className="input-group-modern">
            <label><Tag size={15} /> Category</label>
            <div className="category-pills-container">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Description */}
          <div className="input-group-modern">
            <label><FileText size={15} /> Description</label>
            <textarea
              name="description"
              placeholder="Describe what this event is about..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-modern">
            <button type="button" className="cancel-btn-modern" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn-modern" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
