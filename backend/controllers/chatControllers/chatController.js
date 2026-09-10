const ai = require("../../config/aiConfig");
const Conversation = require("../../models/conversations");
const Message = require("../../models/message");

const getChatResponse = async (req, res) => {
  try {
    const { prompt, cid } = req.body;

    if (!cid) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const conversation = await Conversation.findById(cid);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    //setting limit
    const userMessageCount = await Message.countDocuments({
      conversationId: cid,
      sender: "user",
    });
    let title = "";

    if (userMessageCount + 1 === 3) {
      const userMessages = await Message.find({
        conversationId: cid,
        sender: "user",
      })
        .sort({ createdAt: 1 })
        .limit(2);

      const titlePrompt = `
                Generate a short title for this conversation.

                    Message 1:
                        ${userMessages[0].text}

                    Message 2:
                        ${userMessages[1].text}

                        Rules:
                        - Maximum 5 words
                        - No quotation marks
                        - Return only the title
                        `;

      const titleResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: titlePrompt,
      });

      title = titleResponse.text.trim();

      await Conversation.findByIdAndUpdate(cid, {
        title: title,
      });
      if (title) {
        res.setHeader("X-Chat-Title", title);
      }
    }

    //setting limit to convo
    if (userMessageCount >= 20) {
      return res.status(400).json({
        error: "Conversation limit reached",
        message:
          "This conversation has reached the maximum of 20 messages. Please start a new chat.",
      });
    }

    await new Message({
      conversationId: cid,
      sender: "user",
      text: prompt,
    }).save();

    // Tell browser we're sending a stream
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const history = await Message.find({ conversationId: cid }).sort({
      createdAt: 1,
    });

    const contents = history.map((message) => ({
      role: message.sender === "user" ? "user" : "model",
      parts: [
        {
          text: message.text,
        },
      ],
    }));

    const response = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: contents,
    });

    let fullResponse = "";

    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text;
        res.write(chunk.text);
      }
    }

    await new Message({
      conversationId: cid,
      sender: "ai",
      text: fullResponse,
    }).save();

    res.end();
  } catch (error) {
    console.error("Error fetching chat response:", error);
    res.status(500).json({ error: "Failed to fetch chat response" });
  }
};

//conversation controllers

const createConversation = async (req, res) => {
  try {
    const newConversation = new Conversation({ title: "New Chat" });
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

// Get all conversations
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find();
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

//get all messages for a specific conversation
const getMessagesForConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch messages for conversation" });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndDelete(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await Message.deleteMany({ conversationId: conversationId });

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

module.exports = {
  getChatResponse,
  createConversation,
  getAllConversations,
  getMessagesForConversation,
  deleteConversation,
};
