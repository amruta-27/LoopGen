import { forwardRef, useImperativeHandle, useState } from "react";
import "./Input.css";

const Input = forwardRef(({ placeholder, onSubmit }, ref) => {
  const [input, setInput] = useState("");

  useImperativeHandle(ref, () => ({
    clear: () => setInput(""),
    submit: () => onSubmit(input),
  }), [input, onSubmit]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(input);
    }
  };
  return (
    <>
      <div className="input-container">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          id="message-input"
          onKeyDown={handleKeyDown}
        />
      </div>
    </>
  );
});

export default Input;
