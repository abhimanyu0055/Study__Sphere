import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={user ? "/" : "/login"} className="text-2xl font-bold flex items-center gap-2">
          📚 StudySphere
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            /* IF LOGGED IN: Show Dashboard, Library, Upload, and Logout */
            <div className="flex items-center gap-5">
              <Link to="/" className="hover:text-blue-200 transition font-medium">Dashboard</Link>
              <Link to="/library" className="hover:text-blue-200 transition font-medium">My Library</Link>
              <Link to="/upload" className="bg-white text-blue-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition font-bold">
                + Upload
              </Link>
              <span className="text-blue-200 text-sm hidden md:block">Hi, {user.name}</span>
              <button onClick={handleLogout} className="text-sm border border-blue-400 px-3 py-1 rounded hover:bg-blue-700 transition">
                Logout
              </button>
            </div>
          ) : (
            /* IF NOT LOGGED IN: Only show Login/Register */
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-blue-200 transition font-medium">Login</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition font-bold">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;