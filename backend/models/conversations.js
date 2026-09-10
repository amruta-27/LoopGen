const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: "New Chat",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);