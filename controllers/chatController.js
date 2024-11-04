const Chat = require('../models/Chat');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/errorHandler').ErrorResponse;

exports.createChat = catchAsync(async (req, res) => {
  const { participantId, type, message } = req.body;
  
  const chat = await Chat.create({
    participants: [req.user._id, participantId],
    type,
    messages: [{
      sender: req.user._id,
      content: message
    }]
  });

  await chat.populate('participants', 'name email');
  
  res.status(201).json({
    status: 'success',
    data: chat
  });
});

exports.getChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id
  })
  .populate('participants', 'name email')
  .sort('-lastMessage');

  res.status(200).json({
    status: 'success',
    results: chats.length,
    data: chats
  });
});

exports.getChat = catchAsync(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name email')
    .populate('messages.sender', 'name email');

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Check if user is participant
  if (!chat.participants.some(p => p._id.equals(req.user._id))) {
    throw new AppError('Not authorized to access this chat', 403);
  }

  res.status(200).json({
    status: 'success',
    data: chat
  });
});

exports.sendMessage = catchAsync(async (req, res) => {
  const { message } = req.body;
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  chat.messages.push({
    sender: req.user._id,
    content: message
  });
  chat.lastMessage = Date.now();
  await chat.save();

  await chat.populate('messages.sender', 'name email');

  res.status(200).json({
    status: 'success',
    data: chat
  });
}); 