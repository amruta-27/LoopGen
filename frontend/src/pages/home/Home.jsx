import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./Home.css";

import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import SideBar from "../../components/sidebar/SideBar";
import Chat from "../chat/Chat";

import api from "../../services/api";
import { MessageContext } from "../../context/MessageContext/MessageContext";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const { conversationId } = useParams();

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
      } finally {
        setChatLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, setMessages, setConversationId, setChatLoading]);

  const onSubmit = async (value) => {
    if (!value.trim() || isLoading) return;

    const prompt = value.trim();

    inputRef.current?.clear();
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        text: prompt,
        sender: "user",
      },
    ]);

    try {
      let fullResponse = "";
      let displayedResponse = "";
      let typing = false;

      setMessages((prev) => [
        ...prev,
        {
          text: "",
          sender: "ai",
        },
      ]);

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
            const responseText = progressEvent.event.target.responseText;

            fullResponse = responseText;

            if (!typing) {
              typeNextCharacter();
            }
          },
        },
      );

      const title = response.headers["x-chat-title"];

      if (title) {
        console.log("Updating conversation title to:", title);
        setConversationList((prev) =>
          prev.map((chat) =>
            chat._id === conversationId
              ? {
                  ...chat,
                  title,
                }
              : chat,
          ),
        );
      }
    } catch (error) {
      console.error("Message error:", error);

      if (error.response?.status === 400) {
        setMessages((prev) => [
          ...prev,
          {
            text: "You are out of messages for this chat. Please start a new chat.",
            sender: "ai",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
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
            <div className="input-section">
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
