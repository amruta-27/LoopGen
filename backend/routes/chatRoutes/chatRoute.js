const express = require('express');
const router = express.Router();
const { getChatResponse, createConversation, getAllConversations, getMessagesForConversation, deleteConversation } = require('../../controllers/chatControllers/chatController.js');

router.post('/messages', getChatResponse);
router.post('/newconversation', createConversation);
router.get('/conversations', getAllConversations);
router.get('/conversations/:conversationId/messages', getMessagesForConversation);
router.delete('/conversations/:conversationId', deleteConversation);

module.exports = router;
