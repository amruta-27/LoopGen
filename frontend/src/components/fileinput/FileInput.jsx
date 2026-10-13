import { useRef, useState } from "react";
import "./FileInput.css";
import { FileText, Plus, X } from "lucide-react";
import Toast from "../toast/Toast";

const acceptedFileTypes = [".pdf", ".txt"];
const maxFileSize = 5 * 1024 * 1024;

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const FileInput = ({ selectedFile, onFileChange }) => {
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!acceptedFileTypes.includes(extension)) {
      onFileChange(null);
      setToast({ type: "error", message: "Only PDF and TXT files are supported." });
      return;
    }

    if (file.size === 0) {
      onFileChange(null);
      setToast({
        type: "error",
        message: "This file is empty. Please select another file.",
      });
      return;
    }

    if (file.size > maxFileSize) {
      onFileChange(null);
      setToast({ type: "error", message: "File size must not exceed 5 MB." });
      return;
    }

    setToast({
      type: "success",
      message: `${file.name} attached successfully.`,
    });
    onFileChange(file);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    //setToast({ type: "success", message: "File removed." });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="file-input-control">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {selectedFile && (
        <div className="file-preview" role="status" aria-live="polite">
          <div className="file-preview-icon" aria-hidden="true">
            <FileText size={20} />
          </div>

          <div className="file-preview-details">
            <span className="file-preview-name" title={selectedFile.name}>
              {selectedFile.name}
            </span>
            <span className="file-preview-meta">
              {selectedFile.name.split(".").pop().toUpperCase()} ·{" "}
              {formatFileSize(selectedFile.size)}
            </span>
          </div>

          <button
            type="button"
            className="file-preview-remove"
            onClick={handleRemoveFile}
            aria-label={`Remove ${selectedFile.name}`}
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        className="file-picker"
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileChange}
        aria-label="Choose a PDF or TXT file"
      />

      <button
        type="button"
        className="input-icon"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Attach a file"
        title="Attach a PDF or TXT file"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default FileInput;
