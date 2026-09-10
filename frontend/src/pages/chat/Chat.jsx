//-----------------------------------------------------------------------------------code bloc with effect
import React, { useRef, useEffect, useState } from "react";
import "./Chat.css";

import Thinking from "../../components/thinking/Thinking";
import CodeBlock from "../../components/codeblock/CodeBlock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContext } from "react";
import { MessageContext } from "../../context/MessageContext/MessageContext";
import { LoaderCircle, MessageCircle } from "lucide-react";

const Chat = ({ loading }) => {
  const chatEndRef = useRef(null);
  const { messages, chatLoading } = useContext(MessageContext);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <>
      {chatLoading ? (
        <div className="chat-loader">
          <LoaderCircle className="chat-loader-icon" size={28} />
        </div>
      ) : (
        <div className="chat-container">
          {messages.length > 0 &&
            messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");

                      if (!inline && match) {
                        return (
                          <CodeBlock language={match[1]}>{children}</CodeBlock>
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ))}

          {messages.length === 0 && !loading && (
            <div className="no-messages">
              <div className="no-messages-icon">
                <MessageCircle />
              </div>

              <h2>Start a conversation</h2>

              <p>Ask me anything, and I’ll help you find the answer.</p>
            </div>
          )}

          {loading && <Thinking />}

          <div ref={chatEndRef}></div>
        </div>
      )}
    </>
  );
};

export default Chat;
