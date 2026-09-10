import "./DeleteModal.css";
import { useEffect, useRef, useState } from "react";

const DeleteModal = ({
  conversationTitle,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(closeTimer.current);
  }, []);

  const closeModal = () => {
    if (isDeleting || isClosing) return;

    setIsClosing(true);
    closeTimer.current = setTimeout(onCancel, 180);
  };

  const handleConfirm = async () => {
    const deleted = await onConfirm();

    if (deleted) {
      setIsClosing(true);
      closeTimer.current = setTimeout(onCancel, 180);
    }
  };

  return (
    <div
      className={`delete-modal-backdrop${isClosing ? " closing" : ""}`}
      role="presentation"
      onMouseDown={closeModal}
    >
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="delete-modal-title">Delete chat?</h2>
        <p>
          Delete <strong>{conversationTitle || "New Chat"}</strong> and all of
          its messages? This cannot be undone.
        </p>

        {error && <p className="delete-modal-error">{error}</p>}

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-modal-cancel"
            onClick={closeModal}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-modal-confirm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
