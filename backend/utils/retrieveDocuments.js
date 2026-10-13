
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

async function retrieveDocuments(db, question, conversationId = null) {
  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: db.collection("documentchunks"),
    indexName: "loopgen_vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });

  // Never search all documents globally.
  if (!conversationId) {
    return [];
  }

  const results = await vectorStore.similaritySearch(question, 3, {
    conversationId: { $eq: conversationId },
  });

  return results;
}

module.exports = { retrieveDocuments };
