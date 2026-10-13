# LoopGen AI

LoopGen is a conversational AI application that supports chat history, streaming AI responses, and document-grounded question answering using Retrieval-Augmented Generation (RAG). Users can upload PDF or plain-text documents and ask questions based on their contents.

🚀 **Live Demo:** [https://loopgenai.netlify.app/](https://loopgenai.netlify.app/)

## Features

- **Conversational AI:** Create, browse, and delete conversations.
- **Streaming Responses:** Receive AI-generated responses as they are streamed.
- **Conversation Titles:** Automatically generate conversation titles after the initial messages.
- **Document Uploads:** Upload a PDF or TXT document to a conversation.
- **Retrieval-Augmented Generation (RAG):** Extract and split document text into chunks, generate embeddings, and retrieve relevant content for answering questions.
- **Vector Search:** Store document chunks and embeddings in MongoDB Atlas and retrieve relevant information using Atlas Vector Search.
- **Context-Aware Q&A:** Ask questions and follow-ups about uploaded documents.
- **User Feedback:** Display upload, request, and validation messages through dismissible toast notifications.

## Tech Stack

| Category | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Vector Search | MongoDB Atlas Vector Search |
| AI and Embeddings | Google Gemini API, LangChain |

## Project Structure

```text
LoopGen/
├── backend/
│   ├── config/          # Database and AI configuration
│   ├── controllers/     # Chat and document handlers
│   ├── models/          # Conversation and message models
│   ├── routes/          # API routes
│   ├── services/        # RAG response service
│   ├── utils/           # Document loading, storage, retrieval
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Prerequisites

Before running the project locally, ensure you have:

- [Node.js](https://nodejs.org/) and npm installed.
- A MongoDB database accessible to the backend. MongoDB Atlas is required for the configured Atlas Vector Search integration.
- A Google AI API key with access to the configured Gemini chat and embedding models.

## Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_ai_api_key
```

Replace the placeholder values with your actual credentials.

**Important:** Never commit `.env` files, API keys, or database credentials to GitHub.

### MongoDB Atlas Vector Search Setup

Document chunks are stored in the `documentchunks` collection. The application uses a vector search index named `loopgen_vector_index`.

Configure the index with these fields:

| Field | Configuration |
| --- | --- |
| `embedding` | Vector field, 3072 dimensions, cosine similarity |
| `conversationId` | Filter field |

The embedding configuration corresponds to the currently configured `gemini-embedding-001` model.

Retrieval is filtered by the active conversation ID to keep document searches scoped to that conversation.

### Frontend API Configuration

The API client is located at:

`frontend/src/services/api.js`

It currently points to the deployed LoopGen API. To run the application locally, update the API URL to:

```js
http://localhost:5000/api
```

The backend enables CORS for browser requests.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amruta-27/LoopGen.git
cd LoopGen
```

### 2. Start the Backend

Open a terminal and run:

```bash
cd backend
npm install
npm start
```

The backend runs on port `5000` by default, unless another port is configured in `backend/.env`.

You can check the server at:

`http://localhost:5000/`

### 3. Start the Frontend

Update the frontend API URL to the local backend, then open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL, typically:

`http://localhost:5173`

## API Endpoints

All endpoints are mounted under `/api/chat`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/newconversation` | Create a new conversation |
| `GET` | `/conversations` | Retrieve conversations |
| `GET` | `/conversations/:conversationId/messages` | Retrieve messages for a conversation |
| `DELETE` | `/conversations/:conversationId` | Delete a conversation |
| `POST` | `/messages` | Send a prompt and stream the AI response |
| `POST` | `/documents/upload?conversationId=:id` | Upload and process a document |

The document upload endpoint expects `multipart/form-data` with a single file field named `document`.

## Document Upload Limitations

- **Supported formats:** PDF and TXT
- **Maximum file size:** 5 MB
- **Files per upload:** One
- **Text extraction:** Documents must contain readable, extractable text. Scanned PDFs without an OCR text layer may not work.

## Available Scripts

### Frontend

Run these commands from the `frontend/` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

### Backend

Run `npm start` from the `backend/` directory to start the API server. A backend test script is not currently configured.

---

**Built with React, Node.js, MongoDB Atlas, LangChain, and Google Gemini.**
