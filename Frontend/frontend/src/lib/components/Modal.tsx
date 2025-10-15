import React from 'react';
import './modal.css';

type ModalProps = {
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function Modal({ onClose, title, children }: ModalProps) {
  return (
    <div className="app-modal" role="dialog" aria-modal="true">
      <div className="app-modal-backdrop" onClick={onClose} />
      <div className="app-modal-content">
        <div className="app-modal-header">
          {title && <h3>{title}</h3>}
          <button className="app-modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
}
