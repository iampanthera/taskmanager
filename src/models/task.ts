import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['pending', 'in progress', 'completed'] },
  tags: { type: [String] },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

TaskSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Task', TaskSchema);
