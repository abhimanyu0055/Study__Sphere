const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({ term: { type: String, required: true }, definition: { type: String, required: true } });
const replySchema = new mongoose.Schema({ replierName: { type: String, required: true }, replyText: { type: String, required: true }, createdAt: { type: Date, default: Date.now } });
const questionSchema = new mongoose.Schema({ askerName: { type: String, required: true }, questionText: { type: String, required: true }, replies: [replySchema], createdAt: { type: Date, default: Date.now } });
const reviewSchema = new mongoose.Schema({ reviewerName: { type: String, required: true }, rating: { type: Number, required: true, min: 1, max: 5 }, comment: { type: String, required: true }, createdAt: { type: Date, default: Date.now } });

const resourceSchema = new mongoose.Schema({
  // NEW: The unique serial number for easy querying
  serialNumber: { type: Number, required: true, unique: true },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjectCode: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  department: { type: String, required: true },
  tags: [{ type: String }], 
  fileUrl: { type: String, required: true },
  reviews: [reviewSchema], 
  flashcards: [flashcardSchema], 
  questions: [questionSchema],
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

resourceSchema.index({ subjectCode: 1, viewCount: -1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);