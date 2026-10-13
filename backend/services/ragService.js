const ai = require("../config/aiConfig");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const { retrieveDocuments } = require("../utils/retrieveDocuments");

async function streamRagAnswer(
  db,
  question,
  chatHistory = [],
  conversationId = null,
) {
  console.time("RAG retrieval");

  const documents = await retrieveDocuments(db, question, conversationId);

  console.timeEnd("RAG retrieval");

  const context = documents.map((doc) => doc.pageContent).join("\n\n");

  const history = chatHistory
    .map((message) => {
      const role = message.sender === "user" ? "Human" : "Assistant";
      return `${role}: ${message.text}`;
    })
    .join("\n");

  const systemPrompt = `You are LoopGen, a helpful AI assistant.

When relevant document context is provided, use it to answer questions about that document.
Do not invent facts about the document. If the requested information is not present in the provided context, clearly explain that you couldn't find it in the document.

When no relevant document context is provided, answer general questions normally using your knowledge.

Use conversation history to understand follow-up questions, but do not treat previous assistant answers as verified facts.

Conversation history:
${history || "No previous messages."}

Retrieved document context:
${context || "No relevant document context was found for this conversation."}`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(question),
  ];

  console.time("Gemini stream setup");
  const stream = await ai.stream(messages);
  console.timeEnd("Gemini stream setup");

  return stream;
}

module.exports = { streamRagAnswer };
