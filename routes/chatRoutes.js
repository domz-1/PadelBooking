const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(chatController.getChats)
  .post(chatController.createChat);

router
  .route('/:id')
  .get(chatController.getChat);

router
  .route('/:id/messages')
  .post(chatController.sendMessage);

module.exports = router; 