const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure your User model path is correct
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// USER REGISTRATION
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, semester } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name, email, password: hashedPassword, department, semester
    });
    const savedUser = await newUser.save();
    
    res.status(201).json({ message: "User created successfully", userId: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// USER LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // In a real app, use a proper secret key from your .env file
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SYLLABUS INTEGRATION: $addToSet OPERATOR
// Add a resource to user's bookmarks safely
// ==========================================
router.post('/:userId/bookmarks/:resourceId', async (req, res) => {
  try {
    const { userId, resourceId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      // $addToSet acts like $push, but mathematically guarantees no duplicate ObjectIds
      { $addToSet: { bookmarks: resourceId } },
      { returnDocument: 'after' } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: "Bookmarked successfully", bookmarks: updatedUser.bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;