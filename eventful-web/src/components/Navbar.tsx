import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <FaTicketAlt className="text-indigo-600 dark:text-indigo-400 text-xl" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Eventful
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Welcome, {user.name}!
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            )}
            {/* ?? Dark Mode Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
