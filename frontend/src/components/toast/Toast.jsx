import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import "./Toast.css";

const Toast = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message || !duration || !onClose) return undefined;

    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`toast toast-${isError ? "error" : "success"}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      {isError ? (
        <AlertCircle size={18} aria-hidden="true" />
      ) : (
        <CheckCircle2 size={18} aria-hidden="true" />
      )}
      <span className="toast-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
