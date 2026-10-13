require('dotenv').config();
// const { GoogleGenAI } = require('@google/genai');

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// module.exports = ai;


const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const ai = new ChatGoogleGenerativeAI({
model: "gemini-3.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.7,
});

module.exports = ai;
