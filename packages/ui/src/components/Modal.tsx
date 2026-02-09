import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
      previousActiveRef.current?.focus();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    previousActiveRef.current?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${className}`.trim()}
      aria-modal="true"
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}
