import mongoose from 'mongoose';
const BlockSchema = new mongoose.Schema({
  warnedId: { type: String, required: true },
  groupId: String,
  dateWarn: [
    {
      adminId: String,
      date: String,
      reason: String,
    },
  ],
  count: { type: Number, default: 0 },
});

const warndb = mongoose.model('warndb', BlockSchema);
export default warndb;
