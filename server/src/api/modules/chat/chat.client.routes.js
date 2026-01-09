const express = require('express');
const { sendMessage, getMessages } = require('./chat.controller');
const { protect } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);


router.post('/', sendMessage);

router.get('/:userId', getMessages);

module.exports = router;
