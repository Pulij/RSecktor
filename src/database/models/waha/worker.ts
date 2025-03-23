import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  api_key: { type: String, required: true },
  capacity: { type: Number, required: true },
});

WorkerSchema.virtual('active_sessions', {
  ref: 'WAHASession',
  localField: '_id',
  foreignField: 'worker_id',
  count: true, // Возвращает число сессий вместо массива
});

const Worker = mongoose.model('Worker', WorkerSchema);
export default Worker;
