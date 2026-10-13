const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const storeChunks = async (
  db,
  chunks,
  { conversationId, documentId, source },
) => {
  if (!db) {
    throw new Error("Database connection is required.");
  }

  if (!conversationId || !documentId || !source) {
    throw new Error(
      "Conversation ID, document ID, and source filename are required.",
    );
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No document chunks are available to store.");
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
  });

  // Generate embeddings for all chunks using the existing model.
  const vectors = await embeddings.embedDocuments(
    chunks.map((chunk) => chunk.pageContent),
  );

  if (vectors.length !== chunks.length) {
    throw new Error("Embedding count does not match the chunk count.");
  }

  const now = new Date();

  const documents = chunks.map((chunk, index) => ({
    text: chunk.pageContent,
    source,
    conversationId,
    documentId,
    chunkIndex: index,
    embedding: vectors[index],
    createdAt: now,
  }));

  const result = await db
    .collection("documentchunks")
    .insertMany(documents, { ordered: true });

  return {
    insertedCount: result.insertedCount,
    documentId,
    conversationId,
  };
};

module.exports = { storeChunks };
