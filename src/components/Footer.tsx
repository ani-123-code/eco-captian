import { Link } from 'react-router-dom';
import { Mail, Phone, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A202C] text-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-10 lg:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center mb-3 sm:mb-4">
              <img src="/image.png" alt="EcoCaptain Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-2 sm:mr-3" />
              <span className="text-2xl sm:text-3xl font-bold text-white">Eco<span className="text-[#10B981]">Captain</span></span>
            </Link>
            <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              EcoCaptain is an innovative platform that empowers local communities by designating "Eco Captains" in neighborhoods, societies, or zones to organize and streamline e-waste collection. We turn recycling into an accessible, rewarding, and community-driven effort, fostering environmental responsibility at the grassroots level.
            </p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-start">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#10B981] mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                <a href="mailto:team@eco-dispose.com" className="text-gray-300 hover:text-[#10B981] transition-colors text-sm sm:text-base break-all">team@eco-dispose.com</a>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#10B981] mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                <a href="tel:8861009443" className="text-gray-300 hover:text-[#10B981] transition-colors text-sm sm:text-base">88610 09443</a>
              </div>
            </div>
            {/* Social Media Links */}
            <div className="flex space-x-3 sm:space-x-4">
              <a href="https://www.youtube.com/@EcoDispose" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#10B981] transition-colors" aria-label="YouTube">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="https://www.instagram.com/clenrgy.eco.dispose/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#10B981] transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="https://www.linkedin.com/company/clenrgy-eco-dispose-india-llp/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#10B981] transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75c.97 0 1.75.79 1.75 1.75s-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.07-.93-1.5-1.5-1.5s-1.5.43-1.5 1.5v4.5h-3v-9h3v1.29c.63-1.03 1.8-1.29 2.56-1.29 1.84 0 3.44 1.51 3.44 3.75v5.25z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b border-gray-700 pb-2 text-white">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-[#10B981] transition-colors text-sm sm:text-base">Home</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-[#10B981] transition-colors text-sm sm:text-base">Join as EcoCaptain</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-[#10B981] transition-colors text-sm sm:text-base">Login</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b border-gray-700 pb-2 text-white">Services</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><span className="text-gray-300 text-sm sm:text-base">E-Waste Collection</span></li>
              <li><span className="text-gray-300 text-sm sm:text-base">Community Engagement</span></li>
              <li><span className="text-gray-300 text-sm sm:text-base">Reward System</span></li>
              <li><span className="text-gray-300 text-sm sm:text-base">Sustainability Solutions</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} EcoCaptain. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right">
              Powered by <a href="https://www.eco-dispose.com" target="_blank" rel="noopener noreferrer" className="text-[#10B981] font-semibold hover:underline transition-colors">Eco Dispose</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
