import React from 'react';

// PUBLIC_INTERFACE
export default function Modal({ title, children, onClose }) {
  /** Generic modal with title and close action. */
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>{title}</h3>
          <button className="btn secondary" onClick={onClose} type="button" aria-label="Close modal">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
