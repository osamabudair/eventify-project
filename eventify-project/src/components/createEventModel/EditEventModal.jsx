import React from 'react';
import CreateEventModal from './CreateEventModal';
import './EditEventModal.css';

const EditEventModal = ({
  isOpen,
  onClose,
  onEventUpdated,
  eventData,
  showToast,
  ...rest
}) => {
  return (
    <CreateEventModal
      isOpen={isOpen}
      onClose={onClose}
      onEventUpdated={onEventUpdated}
      eventData={eventData}
      showToast={showToast}
      {...rest}
    />
  );
};

export default EditEventModal;

