import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, UserPlus, Recycle, Leaf, Shield, TrendingUp, ArrowLeft, Home } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, profile } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (profile) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      await signIn(email.trim(), password);
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-50 to-teal-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-light-green-100 rounded-full p-3 sm:p-4">
              <Recycle className="w-10 h-10 sm:w-12 sm:h-12 text-light-green-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            EcoCaptain
          </h1>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
            E-Waste Management Platform
          </p>
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Transforming electronic waste into sustainable opportunities
          </p>

          {/* Benefits Section */}
          <div className="mb-6 sm:mb-8 bg-light-green-50/50 rounded-xl p-3 sm:p-4 border border-light-green-200">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-light-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">Eco-Friendly</p>
                <p className="text-xs text-gray-600">Sustainable disposal</p>
              </div>
              <div>
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-light-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">Earn Money</p>
                <p className="text-xs text-gray-600">Get paid for e-waste</p>
              </div>
              <div>
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-light-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">Secure</p>
                <p className="text-xs text-gray-600">Safe & reliable</p>
              </div>
              <div>
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <Recycle className="w-5 h-5 sm:w-6 sm:h-6 text-light-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">Recycle</p>
                <p className="text-xs text-gray-600">Proper processing</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-light-green-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-light-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <a
              href="/register"
              className="block w-full bg-white border-2 border-light-green-500 text-light-green-600 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-light-green-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Join as EcoCaptain
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
