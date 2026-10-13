
const multer = require("multer");
const mongoose = require("mongoose");
const crypto = require("crypto");

const {
  loadUploadedDocument,
  splitDocument,
} = require("../../utils/documentLoader");

const { storeChunks } = require("../../utils/storeDocument");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Only PDF and TXT files are allowed."));
  },
});

const uploadDocument = [
  upload.single("document"),

  async (req, res) => {
    try {
      // 1. Validate the uploaded file.
      if (!req.file) {
        return res.status(400).json({
          error: "Please select a PDF or TXT document.",
        });
      }

      // 2. Get the conversation ID from the upload request.
      const { conversationId } = req.query;

      if (!conversationId) {
        return res.status(400).json({
          error: "Conversation ID is required.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({
          error: "Invalid conversation ID.",
        });
      }

      // 3. Get the existing MongoDB connection.
      const db = mongoose.connection.db;

      if (!db) {
        return res.status(503).json({
          error: "Database is not available.",
        });
      }

      // 4. Extract text from the PDF or TXT file.
      const document = await loadUploadedDocument(req.file);

      // 5. Split the extracted text into overlapping chunks.
      const chunks = await splitDocument(document);

      if (!chunks.length) {
        return res.status(400).json({
          error: "No readable content was found in the document.",
        });
      }

      // 6. Generate a unique ID for this uploaded document.
      const documentId = crypto.randomUUID();

      // 7. Generate embeddings and store the chunks in MongoDB.
      const result = await storeChunks(db, chunks, {
        conversationId,
        documentId,
        source: req.file.originalname,
      });

      // 8. Return the upload result.
      return res.status(201).json({
        message: "Document processed and stored successfully.",
        filename: req.file.originalname,
        documentId: result.documentId,
        chunksStored: result.insertedCount,
        conversationId,
      });
    } catch (error) {
      console.error("Document processing failed:", error);

      // Handle Multer upload errors separately from processing errors.
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File size must not exceed 5 MB.",
          });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            error: "Only one file can be uploaded at a time.",
          });
        }

        return res.status(400).json({
          error: "File upload failed. Please try again.",
        });
      }

      return res.status(400).json({
        error: error.message || "Unable to process the uploaded document.",
      });
    }
  },
];

module.exports = { uploadDocument };
