const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { PDFParse } = require("pdf-parse");

const loadUploadedDocument = async (file) => {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new Error("A valid uploaded file is required.");
  }

  let text = "";

  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (file.mimetype === "text/plain") {
    text = file.buffer.toString("utf-8");
  } else {
    throw new Error("Only PDF and TXT files are supported.");
  }

  text = text.replace(/\u0000/g, "").trim();

  if (!text) {
    throw new Error(
      "No readable text was found. The PDF may be scanned or empty.",
    );
  }

  return new Document({
    pageContent: text,
    metadata: { source: file.originalname },
  });
};

const splitDocument = async (document) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  return splitter.splitDocuments([document]);
};

module.exports = { loadUploadedDocument, splitDocument };
