import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', rollNumber: '', yearOfStudy: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...formData,
        yearOfStudy: Number(formData.yearOfStudy) // Ensure it is sent as a number
      });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create an Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Roll Number</label>
              <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none uppercase"
                value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value.toUpperCase()})} />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
              <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
                value={formData.yearOfStudy} onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}>
                <option value="" disabled>Select</option>
                <option value="1">1st</option>
                <option value="2">2nd</option>
                <option value="3">3rd</option>
                <option value="4">4th</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <button type="submit" disabled={isSubmitting} className={`w-full font-bold py-3.5 rounded-lg transition-all mt-6 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'} text-white`}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;