import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, Star, Eye, Filter, Sparkles, X } from 'lucide-react';

const Home = () => {
  const [resources, setResources] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSmartMatch, setShowSmartMatch] = useState(false);
  
  const [filters, setFilters] = useState({
    maxSemester: 8,
    excludeDepartment: 'NONE',
    minViews: 0
  });

  const [smartProfile, setSmartProfile] = useState({
    targetSemester: 6,
    targetDepartments: ['CSE'] 
  });

  useEffect(() => {
    fetchResources();
    fetchTrending();
  }, []);

  // ==========================================
  // Standard Fetch & Search
  // ==========================================
  const fetchResources = async (query = '') => {
    setLoading(true);
    try {
      const url = query 
        ? `http://localhost:5000/api/resources/search?q=${query}` 
        : 'http://localhost:5000/api/resources';
      const res = await axios.get(url);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/resources/trending/subjects');
      setTrending(res.data);
    } catch (err) {
      console.error("Error fetching trending data:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(searchQuery);
  };

  // ==========================================
  // SYLLABUS INTEGRATION: Advanced Filtering ($gt, $lte, $ne)
  // ==========================================
  const applyAdvancedFilters = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/resources/filter/advanced', {
        maxSemester: Number(filters.maxSemester),
        excludeDepartment: filters.excludeDepartment,
        minViews: Number(filters.minViews)
      });
      setResources(res.data);
      setShowFilters(false); 
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SYLLABUS INTEGRATION: Smart Recommendations ($and, $or, $not)
  // ==========================================
  const getSmartRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/resources/filter/recommendations', {
        targetSemester: Number(smartProfile.targetSemester),
        targetDepartments: smartProfile.targetDepartments,
        minViews: 5
      });
      setResources(res.data);
      setShowSmartMatch(false); 
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptToggle = (dept) => {
    const currentDepts = smartProfile.targetDepartments;
    if (currentDepts.includes(dept)) {
      setSmartProfile({ ...smartProfile, targetDepartments: currentDepts.filter(d => d !== dept) });
    } else {
      setSmartProfile({ ...smartProfile, targetDepartments: [...currentDepts, dept] });
    }
  };

  return (
    <div>
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Master Your Coursework</h1>
          <p className="text-xl text-blue-100 mb-8 font-light">The centralized hub for notes, past papers, and study guides.</p>
          
          <div className="max-w-3xl mx-auto">
            {/* Search Bar Row */}
            <div className="flex flex-col md:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2 bg-white p-2 rounded-xl shadow-lg">
                <div className="flex-1 flex items-center px-4">
                  <Search className="text-gray-400 w-5 h-5 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search by keyword..." 
                    className="w-full py-2 text-gray-800 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md">
                  Search
                </button>
              </form>
              
              <div className="flex gap-2 justify-center mt-2 md:mt-0">
                {/* Filter Toggle Button */}
                <button 
                  onClick={() => { setShowFilters(!showFilters); setShowSmartMatch(false); }}
                  className="bg-indigo-600 border border-indigo-500 text-white px-4 py-3 rounded-xl hover:bg-indigo-500 transition shadow-lg flex items-center gap-2 font-semibold"
                >
                  <Filter className="w-5 h-5" /> Filters
                </button>

                {/* Smart Match Button */}
                <button 
                  onClick={() => { setShowSmartMatch(!showSmartMatch); setShowFilters(false); }}
                  className="bg-yellow-500 text-indigo-900 px-4 py-3 rounded-xl hover:bg-yellow-400 transition shadow-lg flex items-center gap-2 font-bold"
                >
                  <Sparkles className="w-5 h-5" /> Smart Match
                </button>
              </div>
            </div>

            {/* Advanced Filters Dropdown Panel */}
            {showFilters && (
              <form onSubmit={applyAdvancedFilters} className="mt-4 bg-white text-gray-800 p-6 rounded-xl shadow-2xl text-left border-t-4 border-indigo-500">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-600"/> Advanced Database Filters</h3>
                  <button type="button" onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-red-500 transition"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Max Semester ($lte)</label>
                    <input type="number" min="1" max="8" className="w-full p-2 border border-gray-200 rounded bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={filters.maxSemester} onChange={(e) => setFilters({...filters, maxSemester: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Exclude Dept ($ne)</label>
                    <select className="w-full p-2 border border-gray-200 rounded bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={filters.excludeDepartment} onChange={(e) => setFilters({...filters, excludeDepartment: e.target.value})}>
                      <option value="NONE">None</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                      <option value="EE">EE</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Min Views ($gt)</label>
                    <input type="number" min="0" className="w-full p-2 border border-gray-200 rounded bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={filters.minViews} onChange={(e) => setFilters({...filters, minViews: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { fetchResources(); setShowFilters(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Reset</button>
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-bold shadow">Execute Query</button>
                </div>
              </form>
            )}

            {/* Dynamic Smart Match Panel */}
            {showSmartMatch && (
              <form onSubmit={getSmartRecommendations} className="mt-4 bg-white text-gray-800 p-6 rounded-xl shadow-2xl text-left border-t-4 border-yellow-400">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500"/> Personalize Your Recommendations
                  </h3>
                  <button type="button" onClick={() => setShowSmartMatch(false)} className="text-gray-400 hover:text-red-500 transition"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">I am in Semester:</label>
                  <input type="number" min="1" max="8" className="w-full md:w-1/3 p-2 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none" 
                    value={smartProfile.targetSemester} onChange={(e) => setSmartProfile({...smartProfile, targetSemester: e.target.value})} />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">My Subjects belong to (Select multiple):</label>
                  <div className="flex flex-wrap gap-3">
                    {["CSE", "ECE", "MECH", "EE", "CIVIL"].map(dept => (
                      <label key={dept} className={`cursor-pointer px-4 py-2 rounded-lg font-medium border transition-all ${
                        smartProfile.targetDepartments.includes(dept) 
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}>
                        <input type="checkbox" className="hidden" 
                          checked={smartProfile.targetDepartments.includes(dept)}
                          onChange={() => handleDeptToggle(dept)} 
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { fetchResources(); setShowSmartMatch(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancel</button>
                  <button type="submit" disabled={smartProfile.targetDepartments.length === 0} className="bg-yellow-500 text-indigo-900 px-6 py-2 rounded-lg hover:bg-yellow-400 transition font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed">
                    Find My Materials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: Resources List */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-blue-600 w-6 h-6" /> Materials List
            </h2>
            <button onClick={() => fetchResources()} className="text-sm text-blue-500 hover:text-blue-700 font-medium transition">
              View All
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No materials found matching this query.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {resources.map((resource) => (
                <div key={resource._id} className="bg-white border border-gray-100 p-6 rounded-xl hover:shadow-xl transition-shadow duration-300 group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                          SN-{resource.serialNumber}
                        </span>
                        <Link to={`/resource/${resource._id}`} className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {resource.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wide">
                          {resource.subjectCode}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {resource.department} • Sem {resource.semester}
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100 whitespace-nowrap ml-4" title="Total Views">
                      <Eye className="w-4 h-4 mr-1" /> {resource.viewCount}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2 mt-2">{resource.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Aggregation Dashboard */}
        <div className="md:w-1/3">
          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Star className="text-yellow-500 w-6 h-6 fill-current" /> Trending Subjects
            </h2>
            <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">Top rated by student community.</p>
            
            {trending.length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-4">Data aggregating...</p>
            ) : (
              <ul className="space-y-4">
                {trending.map((trend, index) => (
                  <li key={trend._id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold w-4">{index + 1}.</span>
                      <span className="font-bold text-gray-700 group-hover:text-blue-600 transition">{trend._id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-800 font-bold flex items-center justify-end gap-1">
                        {trend.averageRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-xs text-gray-400">{trend.totalReviews} reviews</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;