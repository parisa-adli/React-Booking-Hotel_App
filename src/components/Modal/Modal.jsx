import { useEffect, useId, useRef } from "react";
import { HiX } from "react-icons/hi";

// Native <dialog> opened with showModal(): the browser traps focus, makes
// the page behind it inert, closes on Escape and restores focus on close.
function Modal({ isOpen, onClose, title, children, footer, variant = "sheet" }) {
  const dialogRef = useRef();
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${variant}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
    >
      {isOpen && (
        <div className="modalPanel">
          <div className="modalHeader">
            <h2 id={titleId} className="modalTitle">
              {title}
            </h2>
            <button
              type="button"
              className="iconBtn"
              onClick={onClose}
              aria-label="Close"
            >
              <HiX aria-hidden="true" />
            </button>
          </div>
          <div className="modalBody">{children}</div>
          {footer && <div className="modalFooter">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export default Modal;
