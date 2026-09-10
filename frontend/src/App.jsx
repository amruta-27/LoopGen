import "./App.css";
import Home from "./pages/home/Home";
import NewChat from "./pages/newchat/NewChat";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<NewChat />} />
        <Route path="/:conversationId" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
