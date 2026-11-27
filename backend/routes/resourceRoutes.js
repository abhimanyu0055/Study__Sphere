const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// ==========================================
// 1. SEARCH ROUTE (Must be above /:id)
// ==========================================
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    // Uses MongoDB text index for powerful searching across title, description, and tags
    const resources = await Resource.find({ $text: { $search: query } });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. REQUIREMENT: AGGREGATION PIPELINE (Must be above /:id)
// Get top trending subjects based on reviews
// ==========================================
router.get('/trending/subjects', async (req, res) => {
  try {
    const trending = await Resource.aggregate([
      { $unwind: "$reviews" },
      { 
        $group: {
          _id: "$department", // Grouping by the new department field
          averageRating: { $avg: "$reviews.rating" }, 
          totalReviews: { $sum: 1 } 
        }
      },
      { $sort: { averageRating: -1 } },
      { $limit: 5 }
    ]);
    res.json(trending);
  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GET ALL RESOURCES (Recent Materials)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// SYLLABUS: $in OPERATOR
// Fetch all bookmarked resources for a user's library
// ==========================================
router.post('/library/bookmarks', async (req, res) => {
  try {
    // The frontend sends an array of ObjectIds: req.body.bookmarkIds
    const { bookmarkIds } = req.body;
    
    // Find all resources where the _id matches ANY of the IDs in the provided array
    const bookmarkedResources = await Resource.find({
      _id: { $in: bookmarkIds }
    });
    
    res.json(bookmarkedResources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SYLLABUS: COMPARISON OPERATORS ($gt, $lte, $ne, $eq)
// Advanced filtering for study materials
// ==========================================
router.post('/filter/advanced', async (req, res) => {
  try {
    const { maxSemester, excludeDepartment, minViews } = req.body;

    // Build a dynamic query object using Comparison Operators
    const query = {
      // $lte (Less Than or Equal): Find resources for this semester or lower
      semester: { $lte: maxSemester || 8 },
      
      // $ne (Not Equal): Exclude a specific department (e.g., if a student doesn't want CSE materials)
      department: { $ne: excludeDepartment || "NONE" },
      
      // $gt (Greater Than): Only show popular resources with more than X views
      viewCount: { $gt: minViews || 0 }
      
      // Note: { department: "CSE" } is actually shorthand for { department: { $eq: "CSE" } }
    };

    const filteredResources = await Resource.find(query).sort({ viewCount: -1 });
    res.json(filteredResources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// SYLLABUS: DYNAMIC LOGICAL OPERATORS ($and, $or, $not)
// Programmatically building complex queries based on user profile
// ==========================================
router.post('/filter/recommendations', async (req, res) => {
  try {
    // We expect the frontend to send the user's semester and an array of their preferred departments
    const { targetSemester, targetDepartments, minViews = 5 } = req.body;

    // Dynamically build the $or array for departments
    // If targetDepartments is ["CSE", "ECE"], this maps to: [{department: "CSE"}, {department: "ECE"}]
    const departmentOrQuery = targetDepartments.map(dept => ({ department: dept }));

    const recommendedResources = await Resource.find({
      $and: [
        // Condition 1: Dynamically match the requested semester
        { semester: { $eq: targetSemester } },
        
        // Condition 2: Inject our programmatically built $or array
        { $or: departmentOrQuery },
        
        // Condition 3: Must have at least 'minViews' (filters out unused materials)
        { viewCount: { $not: { $lt: minViews } } }
      ]
    }).sort({ viewCount: -1 }); // Sort by most viewed first

    res.json(recommendedResources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// SYLLABUS INTEGRATION: $in OPERATOR
// Fetch all bookmarked resources for My Library
// ==========================================
router.get('/library/:userId', async (req, res) => {
  try {
    const User = require('../models/User'); // Pulling the User model
    const user = await User.findById(req.params.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // The $in operator looks for any Resource where the _id matches ANY of the IDs in the user's bookmarks array
    const bookmarkedResources = await Resource.find({
      _id: { $in: user.bookmarks }
    }).sort({ createdAt: -1 }); // Sort by newest saved
    
    res.json(bookmarkedResources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SYLLABUS: $inc OPERATOR
// GET A SINGLE RESOURCE (and atomically increase view count)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    // We fetch the document AND increment the viewCount by 1 in a single, blazing-fast database operation
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' } // Returns the newly updated document
    );
    
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. CREATE A NEW RESOURCE (Upload)
// ==========================================
router.post('/', async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. DELETE A RESOURCE
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ADD A REVIEW (Level 1 Nesting)
// ==========================================
router.post('/:id/reviews', async (req, res) => {
  try {
    const { reviewerName, rating, comment } = req.body;
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: { reviewerName, rating, comment } } },
      { returnDocument: 'after', runValidators: true }
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. ADD A FLASHCARD (Level 1 Nesting)
// ==========================================
router.post('/:id/flashcards', async (req, res) => {
  try {
    const { term, definition } = req.body;
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $push: { flashcards: { term, definition } } },
      { returnDocument: 'after', runValidators: true } 
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 9. ADD A QUESTION (Level 1 Nesting)
// ==========================================
router.post('/:id/questions', async (req, res) => {
  try {
    const { askerName, questionText } = req.body;
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: { askerName, questionText } } },
      { returnDocument: 'after', runValidators: true } 
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 10. REQUIREMENT: DEEP NESTING UPDATE
// Add a reply to a SPECIFIC question 
// ==========================================
router.post('/:id/questions/:questionId/replies', async (req, res) => {
  try {
    const { replierName, replyText } = req.body;
    // The "questions.$" tells MongoDB to target the exact question matched by the questionId
    const updatedResource = await Resource.findOneAndUpdate(
      { _id: req.params.id, "questions._id": req.params.questionId },
      { $push: { "questions.$.replies": { replierName, replyText } } },
      { returnDocument: 'after', runValidators: true } 
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// SYLLABUS: $pull OPERATOR
// Delete a specific flashcard from the array
// ==========================================
router.delete('/:id/flashcards/:flashcardId', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      // $pull completely removes the object with the matching _id from the array
      { $pull: { flashcards: { _id: req.params.flashcardId } } },
      { returnDocument: 'after' }
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;