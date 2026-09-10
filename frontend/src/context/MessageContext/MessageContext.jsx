import { createContext, useState } from "react";

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState("");
  const [conversationList, setConversationList] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [loadingConversations, SetLoadingConversation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <MessageContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        setLoading,
        conversationId,
        setConversationId,
        conversationTitle,
        setConversationTitle,
        conversationList,
        setConversationList,
        chatLoading,
        setChatLoading,
        loadingConversations,
        SetLoadingConversation,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
