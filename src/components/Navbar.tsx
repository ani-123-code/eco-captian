import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLoginClick = () => {
    if (profile) {
      // If user is logged in, redirect to their dashboard
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <img src="/image.png" alt="EcoCaptain Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
              Eco<span className="text-light-green-600">Captain</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {profile && (
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={handleLoginClick}
                className="text-gray-700 hover:text-light-green-600 transition-colors font-medium text-sm lg:text-base"
              >
                Dashboard
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!profile && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-light-green-600 transition-colors font-medium text-xs sm:text-sm"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors font-semibold text-xs sm:text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline">Join as EcoCaptain</span>
                  <span className="hidden sm:inline lg:hidden">Join</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </>
            )}
            {profile && (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors font-semibold text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
