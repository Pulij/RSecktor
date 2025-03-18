import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '-' },
  orientation: { type: String, default: '-' },
  level: { type: Number, default: 1 },
  msg: { type: Number, default: 0 },
  dirtyMsg: {
    total: { type: Number, default: 0 },
  },
  donate: {
    rsc: { type: Number, default: 0 },
    allSumDonate: { type: Number, default: 0 },
    subscriptions: [
      {
        type: { type: String, required: true, index: true }, // Тип подписки (например, VIP, PremiumVIP, bot_on_account and othr..)
        endDate: { type: Date, index: true }, // Дата окончания подписки
        pausedDays: { type: Number },
        priceMonth: { type: Number },
        additionalData: { type: mongoose.Schema.Types.Mixed }, // Дополнительные данные, если нужны
      },
    ],
  },
  bank: {
    card: { type: Boolean, default: false },
    sumMsgBank: { type: Number, default: 0 },
    cell: { type: Number, default: 1 },
  },
  dataBan: {
    ban: { type: Boolean, default: false },
    typeBan: { type: String, default: '-' },
    dateBan: { type: String, default: '-' },
    dateUnban: { type: String, default: '-' },
    reasonBan: { type: String, default: '-' },
    countBan: { type: Number, default: 0 },
  },
  botOnAccountSettings: {
    isPrivateMode: { type: Boolean, default: false },
  },
  frequentlyUsedCommands: [
    {
      cmdName: { type: String, default: '-' },
      cmdUsageCount: { type: Number, default: 0 },
      lastUsageMonth: { type: String, default: '-' },
    },
  ],
  mail: String,
  pendingMail: String,
  pendingRestore: Boolean,
  confirmationCode: String,
  lastSendMsg: { type: Date, default: new Date() },
  allTimeMessages: { type: Number, default: 0 },
  dateRegisterAccount: { type: Date, default: new Date() },
});

const sck1 = mongoose.model('user', UserSchema);
export default sck1;
