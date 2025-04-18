import React, { useEffect } from 'react';
import '../styles/Modal.css';

function Modal({ title, onClose, children }) {
  // Close modal when clicking outside the modal content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  // Close modal with "Escape" key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onClose}>✖</button> <br/> <br/>
        <div className="form-group">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
