import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, User, MessageCircle, Send, Plus, Trash2, ArrowLeft, Eye, Tag, Star, Bookmark } from 'lucide-react';

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  // Nested Forms State
  const [newFlashcard, setNewFlashcard] = useState({ term: '', definition: '' });
  const [newQuestion, setNewQuestion] = useState({ askerName: 'Student', questionText: '' });
  const [replyInputs, setReplyInputs] = useState({});
  const [newReview, setNewReview] = useState({ reviewerName: 'Student', rating: 5, comment: '' });
  
  // Fetch the real logged-in user from LocalStorage
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  // Depending on how you saved it during login, it might be .id or ._id
  const currentUserId = loggedInUser.id || loggedInUser._id;

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/${id}`);
      setResource(res.data);
    } catch (err) {
      console.error("Error fetching resource:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SYLLABUS: $addToSet (Bookmark Resource)
  // ==========================================
// ==========================================
  // SYLLABUS: $addToSet (Bookmark Resource)
  // ==========================================
  const handleBookmark = async () => {
    if (!currentUserId) {
      alert("Please log in to bookmark materials!");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/auth/${currentUserId}/bookmarks/${resource._id}`);
      alert("Added to your bookmarks successfully! (Triggered $addToSet)");
    } catch (err) {
      console.error("Error bookmarking resource:", err);
      // Let's log the actual backend error message to the console so we know exactly what went wrong if it fails again
      console.log(err.response?.data?.message || err.message); 
      alert("Failed to bookmark.");
    }
  };

  // ==========================================
  // SYLLABUS: $push & $pull (Flashcards)
  // ==========================================
  const handleAddFlashcard = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/resources/${id}/flashcards`, newFlashcard);
      setResource(res.data);
      setNewFlashcard({ term: '', definition: '' });
    } catch (err) {
      console.error("Error adding flashcard:", err);
    }
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resources/${id}/flashcards/${flashcardId}`);
      setResource(prevResource => ({
        ...prevResource,
        flashcards: prevResource.flashcards.filter(card => card._id !== flashcardId)
      }));
    } catch (err) {
      console.error("Error deleting flashcard:", err);
    }
  };

  // ==========================================
  // SYLLABUS: Deep Nesting (Q&A)
  // ==========================================
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/resources/${id}/questions`, newQuestion);
      setResource(res.data);
      setNewQuestion({ askerName: 'Student', questionText: '' });
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  const handleAddReply = async (questionId) => {
    if (!replyInputs[questionId]) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/resources/${id}/questions/${questionId}/replies`, {
        replierName: "Community Member",
        replyText: replyInputs[questionId]
      });
      setResource(res.data);
      setReplyInputs({ ...replyInputs, [questionId]: '' });
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  // ==========================================
  // SYLLABUS: Ratings (Aggregation Source)
  // ==========================================
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/resources/${id}/reviews`, newReview);
      setResource(res.data);
      setNewReview({ reviewerName: 'Student', rating: 5, comment: '' });
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  if (!resource) return <div className="text-center py-20 text-xl font-bold text-gray-400">Material not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Premium Header Gradient Background */}
      <div className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 pb-32 pt-12 px-4 shadow-inner">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center text-indigo-200 hover:text-white font-medium mb-8 transition-colors duration-200 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        
        {/* HERO CARD */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm tracking-wider">
                  SN-{resource.serialNumber}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {resource.title}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm mt-4">
                <span className="font-bold text-indigo-700 bg-indigo-50/80 px-4 py-1.5 rounded-xl uppercase tracking-wide border border-indigo-100">
                  {resource.subjectCode}
                </span>
                <span className="font-semibold text-gray-600 bg-gray-100/80 px-4 py-1.5 rounded-xl border border-gray-200">
                  {resource.department} • Semester {resource.semester}
                </span>
                <span className="flex items-center text-gray-500 font-medium bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-200">
                  <Eye className="w-4 h-4 mr-1.5 text-gray-400" /> {resource.viewCount} views
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {/* BOOKMARK BUTTON */}
              <button 
                onClick={handleBookmark}
                className="bg-white text-indigo-600 border-2 border-indigo-100 px-5 py-3.5 rounded-xl font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                title="Save to My Library"
              >
                <Bookmark className="w-5 h-5" /> Save
              </button>

              <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group">
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" /> Open Material
              </a>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8"></div>
          
          <p className="text-gray-700 text-lg leading-relaxed">{resource.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-8">
            {resource.tags?.map((tag, i) => (
              <span key={i} className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-200">
                <Tag className="w-3.5 h-3.5" /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* MODALITY 1: INTERACTIVE FLASHCARDS */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Study Flashcards</h2>
          </div>
          
          {resource.flashcards && resource.flashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {resource.flashcards.map((card) => (
                <div key={card._id} className="relative group perspective-1000">
                  <button 
                    onClick={() => handleDeleteFlashcard(card._id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 text-red-400 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg backdrop-blur-sm scale-95 hover:scale-105"
                    title="Delete flashcard"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] hover:border-indigo-200 transition-all duration-300 min-h-[160px] flex flex-col justify-center items-center text-center group-hover:-translate-y-1">
                    <h4 className="font-extrabold text-indigo-700 mb-3 text-xl">{card.term}</h4>
                    <p className="text-gray-600 font-medium leading-relaxed">{card.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center mb-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No flashcards created yet. Be the first to add one!</p>
            </div>
          )}

          <form onSubmit={handleAddFlashcard} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">Term</label>
              <input type="text" required placeholder="e.g., MongoDB $pull" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" 
                value={newFlashcard.term} onChange={e => setNewFlashcard({...newFlashcard, term: e.target.value})} />
            </div>
            <div className="flex-[2] w-full relative">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">Definition</label>
              <input type="text" required placeholder="e.g., Removes a specified value from an array." className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" 
                value={newFlashcard.definition} onChange={e => setNewFlashcard({...newFlashcard, definition: e.target.value})} />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 w-full md:w-auto">
              <Plus className="w-5 h-5" /> Add Card
            </button>
          </form>
        </div>

        {/* MODALITY 2: COMMUNITY Q&A */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Community Q&A</h2>
          </div>

          <form onSubmit={handleAddQuestion} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-10 flex flex-col md:flex-row gap-3">
            <input type="text" required placeholder="Ask a question about this material..." className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium transition-all"
              value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})} />
            <button type="submit" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl w-full md:w-auto">
              Post Question
            </button>
          </form>

          <div className="space-y-6">
            {resource.questions?.map((q) => (
              <div key={q._id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <div className="flex gap-4 items-start mb-6">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 border border-emerald-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xl mb-1">{q.questionText}</h4>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Asked by {q.askerName}</span>
                  </div>
                </div>

                <div className="ml-14 space-y-4 relative before:absolute before:inset-y-0 before:-left-6 before:w-px before:bg-gray-200">
                  {q.replies?.map((r) => (
                    <div key={r._id} className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                      <p className="text-gray-700 font-medium mb-2 leading-relaxed">{r.replyText}</p>
                      <span className="text-sm text-indigo-600 font-bold">— {r.replierName}</span>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-2">
                    <input type="text" placeholder="Type a helpful reply..." className="flex-1 p-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
                      value={replyInputs[q._id] || ''} onChange={(e) => setReplyInputs({...replyInputs, [q._id]: e.target.value})} />
                    <button onClick={() => handleAddReply(q._id)} className="bg-indigo-50 text-indigo-700 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-100 border border-indigo-100 transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
                      Reply <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(!resource.questions || resource.questions.length === 0) && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No questions asked yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* MODALITY 3: RATINGS & REVIEWS */}
        <div>
          <div className="flex items-center gap-3 mb-8 border-t border-gray-200 pt-16">
            <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Ratings & Reviews</h2>
          </div>

          <form onSubmit={handleAddReview} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-10">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Leave a Review</h3>
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex-1 relative">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">Your Rating</label>
                <div className="flex gap-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200 items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${newReview.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-[3] relative">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">Your Comment</label>
                <input type="text" required placeholder="What did you think of this material?" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 outline-none font-medium transition-all"
                  value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl w-full md:w-auto">
                Submit Review
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resource.reviews?.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-gray-900">{review.reviewerName}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                </div>
              </div>
            ))}
            {(!resource.reviews || resource.reviews.length === 0) && (
              <div className="col-span-1 md:col-span-2 text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No reviews yet. Rate it and help the community!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResourceDetail;