# LoopGen

LoopGen is a conversational AI application with chat history and document-grounded answers. Users can create conversations, ask questions, and upload PDF or plain-text documents for retrieval-augmented responses.

## Features

- Create, browse, and delete conversations.
- Stream AI responses in the chat.
- Generate conversation titles after the first few messages.
- Upload one PDF or TXT document to a conversation and ask questions about its contents.
- Extract and chunk document text, store embeddings in MongoDB Atlas, and retrieve relevant chunks for answers.
- Display upload, request, and validation feedback with dismissible toast notifications.

## Tech stack

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Node.js, Express
- **Database and vector search:** MongoDB Atlas and Atlas Vector Search
- **AI and embeddings:** Google Gemini through LangChain

## Repository layout

```text
.
├── backend/
│   ├── config/          # Database and AI configuration
│   ├── controllers/     # Chat and document request handlers
│   ├── models/          # Conversation and message models
│   ├── routes/          # API routes
│   ├── services/        # RAG response service
│   ├── utils/           # Document loading, storage, and retrieval
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Requirements

- Node.js and npm
- A MongoDB database reachable by the backend (MongoDB Atlas is required for the configured Atlas Vector Search integration)
- A Google AI API key with access to the configured Gemini chat and embedding models

## Configuration

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_ai_api_key
```

Keep environment files private; do not commit API keys or database credentials.

### MongoDB Atlas Vector Search

Document chunks are stored in the `documentchunks` collection. The backend queries an Atlas Vector Search index named `loopgen_vector_index`. Create that index on `documentchunks` with:

- A vector field named `embedding`, configured for the dimensionality of the configured `gemini-embedding-001` embedding output (3072 dimensions with the current default model settings), using cosine similarity.
- A filter field named `conversationId` with type `filter`.

The vector search is scoped to the active conversation so document content from other conversations is not included in retrieval.

### Frontend API URL

The API client in `frontend/src/services/api.js` currently points to the deployed LoopGen API. To use a local backend, change its `API_URL` to `http://localhost:5000/api` before starting the frontend. The backend enables CORS for browser requests.

## Run locally

Open two terminals from the repository root.

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

The API listens on port `5000` by default (or the port configured in `backend/.env`). The server root responds at `http://localhost:5000/`.

### 2. Start the frontend

Set the frontend API URL to the local backend as described above, then run:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local development URL in the terminal (typically `http://localhost:5173`).

## API overview

All application endpoints are mounted under `/api/chat`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/newconversation` | Create a conversation |
| `GET` | `/conversations` | List conversations |
| `GET` | `/conversations/:conversationId/messages` | Get messages for a conversation |
| `DELETE` | `/conversations/:conversationId` | Delete a conversation |
| `POST` | `/messages` | Send a prompt and stream the AI response |
| `POST` | `/documents/upload?conversationId=:id` | Upload and process a document for a conversation |

The document upload endpoint expects `multipart/form-data` with a single file field named `document`.

## Document upload limits

- Accepted formats: PDF and plain text (`.pdf`, `.txt`)
- Maximum size: 5 MB
- One file per upload
- The document must contain readable text; scanned PDFs without extractable text may not work.

## Frontend scripts

Run these commands from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Backend scripts

Run `npm start` from `backend/` to start the API server. A test script is not configured in the backend package yet.
