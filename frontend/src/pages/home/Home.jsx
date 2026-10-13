import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Home.css";

import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import SideBar from "../../components/sidebar/SideBar";
import Chat from "../chat/Chat";
import FileInput from "../../components/fileinput/FileInput";
import Toast from "../../components/toast/Toast";

import api from "../../services/api";
import { MessageContext } from "../../context/MessageContext/MessageContext";

const getRequestErrorMessage = (error, fallback) => {
  let responseData = error.response?.data;

  if (typeof responseData === "string") {
    try {
      responseData = JSON.parse(responseData);
    } catch {
      return responseData.trim() || fallback;
    }
  }

  return (
    responseData?.message || responseData?.error || error.message || fallback
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    setMessages,
    setConversationList,
    setConversationId,
    setChatLoading,
  } = useContext(MessageContext);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setChatLoading(true);
        setConversationId(conversationId);
        localStorage.setItem("Conversation_ID", conversationId);

        const response = await api.get(
          `/chat/conversations/${conversationId}/messages`,
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
        if (error.response?.status === 404) {
          setMessages([]);
          setConversationId(null);
          localStorage.removeItem("Conversation_ID");
          navigate("/", { replace: true });
          return;
        }

        setToast({
          type: "error",
          message: getRequestErrorMessage(
            error,
            "Unable to load this conversation. Please try again.",
          ),
        });
      } finally {
        setChatLoading(false);
      }
    };

    fetchMessages();
  }, [
    conversationId,
    navigate,
    setMessages,
    setConversationId,
    setChatLoading,
  ]);

  const onSubmit = async (value) => {
    if (!value.trim() || isLoading || !conversationId) return;

    const prompt = value.trim();
    const attachmentName = selectedFile?.name;
    setIsLoading(true);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("document", selectedFile);

        await api.post("/chat/documents/upload", formData, {
          params: { conversationId },
        });

        setSelectedFile(null);
      }

      inputRef.current?.clear();

      setMessages((prev) => [
        ...prev,
        { text: prompt, sender: "user", attachmentName },
        { text: "", sender: "ai" },
      ]);

      let fullResponse = "";
      let displayedResponse = "";
      let typing = false;

      const typeNextCharacter = () => {
        if (displayedResponse.length >= fullResponse.length) {
          typing = false;
          return;
        }

        typing = true;

        displayedResponse = fullResponse.slice(
          0,
          Math.min(displayedResponse.length + 3, fullResponse.length),
        );

        setMessages((prev) => {
          const updatedMessages = [...prev];

          updatedMessages[updatedMessages.length - 1] = {
            text: displayedResponse,
            sender: "ai",
          };

          return updatedMessages;
        });

        setTimeout(typeNextCharacter, 5);
      };

      const response = await api.post(
        "/chat/messages",
        {
          prompt,
          cid: conversationId,
        },
        {
          responseType: "text",
          onDownloadProgress: (progressEvent) => {
            const responseText = progressEvent.event?.target?.responseText;

            if (typeof responseText !== "string") return;

            fullResponse = responseText;

            if (!typing) {
              typeNextCharacter();
            }
          },
        },
      );

      // 3. Preserve your existing conversation-title update.
      const title = response.headers["x-chat-title"];

      if (title) {
        setConversationList((prev) =>
          prev.map((chat) =>
            chat._id === conversationId ? { ...chat, title } : chat,
          ),
        );
      }
      //setToast({ type: "success", message: "Message sent successfully." });
    } catch (error) {
      console.error(
        "Message submission failed:",
        error.response?.data || error,
      );

      const errorMessage = getRequestErrorMessage(
        error,
        "Unable to send your message. Please try again.",
      );

      if (
        error.response?.status === 404 &&
        errorMessage.toLowerCase().includes("conversation not found")
      ) {
        setMessages([]);
        setConversationId(null);
        localStorage.removeItem("Conversation_ID");
        navigate("/", { replace: true });
        return;
      }

      setToast({ type: "error", message: errorMessage });
      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
      <SideBar />

      <div className="sub-container">
        <div className="sections upper-section">
          <div className="chat-section">
            <div className="chat-container">
              <Chat loading={isLoading} />
            </div>
          </div>
        </div>

        {conversationId && (
          <div className="sections lower-section">
            <div className={`input-section${selectedFile ? " has-file" : ""}`}>
              <FileInput
                selectedFile={selectedFile}
                onFileChange={setSelectedFile}
              />
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                onSubmit={onSubmit}
              />

              <Button
                text={isLoading ? "Thinking..." : "Send"}
                onClickFun={() => inputRef.current?.submit()}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
