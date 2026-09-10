import SideBar from "../../components/sidebar/SideBar";
import "./NewChat.css";

const NewChat = () => {
  return (
    <div className="new-chat-page">
      <SideBar />
      <main className="new-chat-content">
        <h1>No chat selected</h1>
        <p>Choose New Chat to start a conversation.</p>
      </main>
    </div>
  );
};

export default NewChat;
