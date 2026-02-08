import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal-box border border-base-300 rounded-lg p-0 max-w-md w-[90%] backdrop:bg-black/40 ${className}`}
      onClose={onClose}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}
