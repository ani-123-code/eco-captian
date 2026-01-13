import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Phone, MapPin, Home, CreditCard, Loader2, CheckCircle2, ArrowLeft, Recycle, Leaf, DollarSign, Shield } from 'lucide-react';
import { registrationsAPI } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    locality: '',
    society: '',
    address: '',
    upi_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.full_name || !formData.email || !formData.phone || !formData.locality) {
      setError('Please fill in all required fields (Name, Email, Phone, Locality)');
      setLoading(false);
      return;
    }

    try {
      await registrationsAPI.submit(formData);
      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        locality: '',
        society: '',
        address: '',
        upi_id: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-green-50 to-teal-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-light-green-100 rounded-full p-3 sm:p-4">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-light-green-600" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Registration Submitted!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Thank you for your interest in becoming an EcoCaptain! Your registration request has been received and is under review.
            </p>
            <div className="bg-light-green-50 border border-light-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">What happens next?</p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 text-left list-disc list-inside">
                <li>Our team will review your application</li>
                <li>You'll receive login credentials via email upon approval</li>
                <li>Start collecting e-waste and earning money</li>
                <li>Help create a sustainable future</li>
              </ul>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              We'll contact you soon to complete the registration process. Welcome to the EcoCaptain family! 🌱
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-light-green-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-light-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-green-50 to-teal-100 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Login</span>
          </button>
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-light-green-100 rounded-full p-3 sm:p-4">
              <Recycle className="w-12 h-12 sm:w-16 sm:h-16 text-light-green-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-2">
            Join as EcoCaptain
          </h1>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-1">
            Become part of the e-waste management revolution
          </p>
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Fill out the form below to request registration. Our team will contact you soon!
          </p>
          
          {/* Benefits Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-light-green-50 to-green-50 rounded-lg p-3 sm:p-4 text-center border border-light-green-200">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-light-green-600 mx-auto mb-1.5 sm:mb-2" />
              <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Earn Money</p>
              <p className="text-xs text-gray-600">Get paid for collecting e-waste</p>
            </div>
            <div className="bg-gradient-to-br from-light-green-50 to-green-50 rounded-lg p-3 sm:p-4 text-center border border-light-green-200">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-light-green-600 mx-auto mb-1.5 sm:mb-2" />
              <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Save Environment</p>
              <p className="text-xs text-gray-600">Contribute to sustainability</p>
            </div>
            <div className="bg-gradient-to-br from-light-green-50 to-green-50 rounded-lg p-3 sm:p-4 text-center border border-light-green-200">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-light-green-600 mx-auto mb-1.5 sm:mb-2" />
              <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">Secure Platform</p>
              <p className="text-xs text-gray-600">Safe and reliable service</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label htmlFor="full_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="10-digit phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="locality" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Locality <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="locality"
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Your locality"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="society" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Society (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="society"
                    type="text"
                    value={formData.society}
                    onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Society name (optional)"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="Your complete address (optional)"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="upi_id" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  UPI ID (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="upi_id"
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="yourname@upi (optional)"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.full_name || !formData.email || !formData.phone || !formData.locality}
              className="w-full bg-light-green-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-light-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Submit Registration Request
                </>
              )}
            </button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
            By submitting this form, you agree to be contacted by our team for the registration process.
          </p>
        </div>
      </div>
    </div>
  );
}
