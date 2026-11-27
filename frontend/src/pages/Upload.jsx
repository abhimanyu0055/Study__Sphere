import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UploadCloud, Book, Hash, Link as LinkIcon, FileText, Building, GraduationCap } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Includes all 8 Root Fields required by the schema
  const [formData, setFormData] = useState({
    serialNumber: '', 
    title: '', 
    subjectCode: '', 
    department: 'CSE',
    semester: '1', 
    description: '', 
    tags: '', 
    fileUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Format types properly before sending to backend
    const payload = {
      ...formData,
      serialNumber: Number(formData.serialNumber),
      semester: Number(formData.semester),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    try {
      await axios.post('http://localhost:5000/api/resources', payload);
      toast.success('Resource published successfully!');
      navigate('/');
    } catch (err) {
      console.error("Error uploading resource:", err);
      // If the serial number is a duplicate, MongoDB throws a specific error we can catch
      if (err.response?.data?.error?.includes('duplicate key error')) {
        toast.error('That Serial Number is already taken!');
      } else {
        toast.error('Failed to publish resource. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="text-center mb-8 pt-4">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Publish Material</h2>
          <p className="text-gray-500 mt-2 text-sm">Share your notes and study guides with the community.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ROW 1: Serial No & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Hash className="w-4 h-4" /> Serial No.
              </label>
              <input type="number" required min="1" placeholder="e.g., 101"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FileText className="w-4 h-4" /> Title
              </label>
              <input type="text" required placeholder="e.g., Automata Final Notes"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
          </div>

          {/* ROW 2: Subject Code, Semester, Department */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Book className="w-4 h-4" /> Subject Code
              </label>
              <input type="text" required placeholder="e.g., CS401"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none uppercase"
                value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value.toUpperCase()})} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> Semester
              </label>
              <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Building className="w-4 h-4" /> Department
              </label>
              <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical (MECH)</option>
                <option value="EE">Electrical (EE)</option>
                <option value="CIVIL">Civil (CIVIL)</option>
              </select>
            </div>
          </div>

          {/* ROW 3: Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea required rows="3" placeholder="Briefly describe what this material covers..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* ROW 4: Tags & File Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Hash className="w-4 h-4" /> Tags (Comma separated)
              </label>
              <input type="text" placeholder="notes, finals, chapter-1"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> File Link
              </label>
              <input type="url" required placeholder="https://drive.google.com/..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={formData.fileUrl} onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 mt-6 ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            } text-white`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Publishing...
              </span>
            ) : (
              'Publish Resource'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;