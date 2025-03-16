const mongoose = require('mongoose');
const statChatSchema = new mongoose.Schema({
  userId: { type: String, index: false },
  chatId: { type: String, index: false },
  name: String,
  gname: String,
  data: {
    msg: {
      dailyMsg: { type: Number, default: 0 },
      allMsg: { type: Number, default: 0 },
      lastMessage: String,
      firstMessage: String,
      firstMessageSentDate: String,
      lastMessageSentDate: String
    },
  }
});

const statChat = mongoose.model("statsChats", statChatSchema, "statsChats");
module.exports = statChat;