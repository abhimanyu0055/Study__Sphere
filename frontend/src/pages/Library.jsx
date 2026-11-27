import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bookmark, BookOpen, Eye, ArrowRight, Tag } from 'lucide-react';

const Library = () => {
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the real logged-in user from LocalStorage
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = loggedInUser.id || loggedInUser._id;

  useEffect(() => {
    if (currentUserId) {
      fetchMyLibrary();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchMyLibrary = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resources/library/${currentUserId}`);
      setSavedResources(res.data);
    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-md">
          <Bookmark className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your personal library.</p>
          <Link to="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
            <Bookmark className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Library</h1>
            <p className="text-gray-500 font-medium mt-1">Your personal collection of saved study materials.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : savedResources.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-2">Your library is empty.</p>
            <Link to="/" className="text-indigo-600 font-bold hover:text-indigo-800 transition">
              Browse Materials
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedResources.map((resource) => (
              <div key={resource._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg hover:border-indigo-100 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm tracking-wider">
                      SN-{resource.serialNumber}
                    </span>
                    <span className="flex items-center text-gray-400 text-xs font-bold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <Eye className="w-3 h-3 mr-1" /> {resource.viewCount}
                    </span>
                  </div>
                  
                  <Link to={`/resource/${resource._id}`}>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {resource.title}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs mt-3 mb-4">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wide">
                      {resource.subjectCode}
                    </span>
                    <span className="font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      Sem {resource.semester}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                    {resource.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
                  <div className="flex gap-1.5">
                    {resource.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                  <Link to={`/resource/${resource._id}`} className="text-indigo-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    Study Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Library;