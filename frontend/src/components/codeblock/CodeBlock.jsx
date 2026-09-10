import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import "./CodeBlock.css";
import { Copy, Check, CodeXml } from "lucide-react";

const CodeBlock = ({ language, children }) => {
  const customTheme = {
    'code[class*="language-"]': {
      color: "#ffffff",
      background: "transparent",
    },

    'pre[class*="language-"]': {
      color: "#ffffff",
      background: "transparent",
      margin: 0,
      padding: "15px",
    },

    comment: {
      color: "#6a9955",
    },

    keyword: {
      color: "#c586c0",
    },

    string: {
      color: "#ce9178",
    },

    function: {
      color: "#dcdcaa",
    },

    number: {
      color: "#b5cea8",
    },
  };

  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-language">
          <span className="code-icon">
            <CodeXml size={18} />
          </span>

          <span>{language || "code"}</span>
        </div>

        <button
          onClick={handleCopy}
          className="copy-button"
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <SyntaxHighlighter
        style={customTheme}
        language={language || "text"}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
