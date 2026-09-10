import "./History.css";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import api from "../../services/api";
import { MessageContext } from "../../context/MessageContext/MessageContext";
import HistorySkeleton from "../skeletons/history/HistorySkeleton";
import DeleteModal from "../deleteModal/DeleteModal";

const AnimatedTitle = ({ title }) => {
  const nextTitle = title || "New Chat";
  const [displayedTitle, setDisplayedTitle] = useState(nextTitle);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const titleRef = useRef(null);
  const titleTextRef = useRef(null);
  const displayedTitleRef = useRef(nextTitle);
  const previousTitle = useRef(nextTitle);

  useEffect(() => {
    const titleElement = titleRef.current;

    if (!titleElement) return;

    const distance =
      titleTextRef.current.scrollWidth - titleElement.clientWidth;

    setOverflowDistance(Math.max(0, distance));
    setIsOverflowing(distance > 0);
  }, [displayedTitle]);

  useEffect(() => {
    if (previousTitle.current === nextTitle) return;

    previousTitle.current = nextTitle;
    setIsAnimating(true);

    let index = displayedTitleRef.current.length;
    const oldTitle = displayedTitleRef.current;
    let timer;

    const erase = () => {
      if (index > 0) {
        index -= 1;
        const nextDisplayedTitle = oldTitle.slice(0, index);
        displayedTitleRef.current = nextDisplayedTitle;
        setDisplayedTitle(nextDisplayedTitle);
        timer = setTimeout(erase, 35);
        return;
      }

      index = 0;
      const type = () => {
        if (index < nextTitle.length) {
          index += 1;
          const nextDisplayedTitle = nextTitle.slice(0, index);
          displayedTitleRef.current = nextDisplayedTitle;
          setDisplayedTitle(nextDisplayedTitle);
          timer = setTimeout(type, 55);
        } else {
          setIsAnimating(false);
        }
      };

      timer = setTimeout(type, 120);
    };

    erase();

    return () => clearTimeout(timer);
  }, [nextTitle]);

  return (
    <span
      ref={titleRef}
      style={{ "--title-shift": `${overflowDistance}px` }}
      className={`history-item-title${isAnimating ? " typing" : ""}${
        isOverflowing ? " overflowing" : ""
      }`}
    >
      <span ref={titleTextRef} className="history-item-title-text">
        {displayedTitle}
      </span>
    </span>
  );
};

const History = ({ conversations }) => {
  const {
    setMessages,
    setConversationId,
    setChatLoading,
    loadingConversations,
    setConversationList,
    setSidebarOpen,
  } = useContext(MessageContext);

  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchMessagesForConversation = (id) => {
    setSidebarOpen(false);
    navigate(`/${id}`);
  };


  const deleteConversation = async () => {
    if (!conversationToDelete) return;

    const id = conversationToDelete._id;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversationList((prev) =>
        prev.filter((conversation) => conversation._id !== id),
      );

      if (id === conversationId) {
        setTimeout(() => {
          setMessages([]);
          setConversationId(null);
          localStorage.removeItem("Conversation_ID");
          navigate("/");
        }, 180);
      }

      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setDeleteError("Unable to delete this chat. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (conversation) => {
    setOpenMenuId(null);
    setDeleteError("");
    setConversationToDelete(conversation);
  };

  return (
    <div className="history-container">
      {loadingConversations ? (
        <HistorySkeleton />
      ) : conversations.length === 0 ? (
        <div className="empty-history">
          <span>No conversations yet</span>
        </div>
      ) : (
        <div className="history-content">
          {[...conversations].reverse().map((conversation) => (
            <div
              key={conversation._id}
              className={`history-item ${
                conversation._id === conversationId ? "active" : ""
              }`}
            >
              <button
                className="history-item-title-button"
                onClick={() => fetchMessagesForConversation(conversation._id)}
              >
                <AnimatedTitle title={conversation.title} />
              </button>
              <div className="history-item-actions">
                <button
                  className="history-item-menu"
                  type="button"
                  aria-label={`More options for ${conversation.title || "New Chat"}`}
                  aria-expanded={openMenuId === conversation._id}
                  title="More options"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuId((currentId) =>
                      currentId === conversation._id ? null : conversation._id,
                    );
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
                {openMenuId === conversation._id && (
                  <div className="history-item-menu-popup">
                    <button
                      type="button"
                      onClick={() => openDeleteModal(conversation)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {conversationToDelete && (
        <DeleteModal
          conversationTitle={conversationToDelete.title}
          isDeleting={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (isDeleting) return;

            setConversationToDelete(null);
          }}
          onConfirm={deleteConversation}
        />
      )}
    </div>
  );
};

export default History;
