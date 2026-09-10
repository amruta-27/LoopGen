import React from "react";
import "./Button.css";

const Button = ({ text, onClickFun, isLoading }) => {
  return (
    <>
      <div className="button-container">
        <button onClick={onClickFun} id="send-button" disabled={isLoading}>
          {text}
        </button>
      </div>
    </>
  );
};

export default Button;
