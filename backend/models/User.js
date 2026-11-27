const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // NEW 
  rollNumber: { type: String, required: true, unique: true },
  yearOfStudy: { type: Number, required: true },
  
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }]
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);