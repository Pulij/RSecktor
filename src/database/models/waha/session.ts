import mongoose from 'mongoose';

const WAHASessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sck1',
    required: true,
    index: true,
  },
  worker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true,
  },
});

const WAHASession = mongoose.model('WAHASession', WAHASessionSchema);
export default WAHASession;
