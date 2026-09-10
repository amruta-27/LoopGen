import React, { useContext, useEffect, useState } from "react";
import "./SideBar.css";

import api from "../../services/api";
import History from "../history/History";

import { SquarePen, PanelLeft } from "lucide-react";

import { MessageContext } from "../../context/MessageContext/MessageContext";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const {
    conversationList,
    setConversationList,
    setConversationId,
    setMessages,
    SetLoadingConversation,
    sidebarOpen,
    setSidebarOpen,
  } = useContext(MessageContext);

  const navigate = useNavigate();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        SetLoadingConversation(true);

        const response = await api.get("/chat/conversations");

        setConversationList(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        SetLoadingConversation(false);
      }
    };

    fetchConversations();
  }, []);

  // Create new conversation
  const createNewConversation = async () => {
    try {
      const response = await api.post("/chat/newconversation");

      setConversationList((prev) => [...prev, response.data]);

      setConversationId(response.data._id);
      setMessages([]);

      localStorage.setItem("Conversation_ID", response.data._id);

      setSidebarOpen(false);
      navigate(`/${response.data._id}`);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-subcontainer">
          {/* HEADER */}
          <div className="sidebar-header">
            {sidebarOpen ? (
              <>
                <h2 className="sidebar-title">ChatGPT</h2>
                <button
                  className="sidebar-toggle"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                >
                  <PanelLeft size={20} />
                </button>
              </>
            ) : (
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <PanelLeft size={20} />
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="sidebar-content">
            {/* NEW CHAT */}
            <div
              className="sidebar-item new-chat"
              onClick={createNewConversation}
            >
              <SquarePen />

              {sidebarOpen && <span>New Chat</span>}
            </div>

            {/* HISTORY TITLE */}
            <div className="history-title">
              {sidebarOpen && <span>History</span>}
            </div>

            {/* HISTORY */}
            {sidebarOpen && <History conversations={conversationList} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
