import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Leaf, 
  DollarSign, 
  BarChart3, 
  Gift,
  ArrowRight,
  CheckCircle,
  Calendar,
  Package,
  CreditCard
} from 'lucide-react';

export function HomePage() {
  const features = [
    { 
      icon: BarChart3, 
      title: 'Captain Dashboard', 
      description: 'A user-friendly interface for captains to track collections, manage community members, and monitor progress' 
    },
    { 
      icon: Users, 
      title: 'Community Engagement Tools', 
      description: 'Resources like messaging, event planners, and educational content to boost participation and awareness' 
    },
    { 
      icon: DollarSign, 
      title: 'Commission System', 
      description: 'Fair reward distribution based on collected waste, incentivizing captains and participants' 
    },
    { 
      icon: TrendingUp, 
      title: 'Reporting', 
      description: 'Detailed analytics and reports on collection volumes, recycling outcomes, and environmental impact' 
    },
    { 
      icon: Gift, 
      title: 'Integration with Rewards', 
      description: 'Seamless connections to loyalty programs, vouchers, or cash incentives for sustained involvement' 
    }
  ];

  const howItWorks = [
    { 
      step: '1', 
      icon: Users,
      title: 'Captain Signup', 
      description: 'Interested residents apply through our platform, get verified, and become zone leaders to rally their community' 
    },
    { 
      step: '2', 
      icon: Package,
      title: 'Waste Logging', 
      description: 'Community members log e-waste details via our intuitive app or website, building up collections over time' 
    },
    { 
      step: '3', 
      icon: Calendar,
      title: 'Monthly Collection', 
      description: 'After 30 days of accumulation, our partner Eco Dispose schedules and handles bulk pickups for efficiency' 
    },
    { 
      step: '4', 
      icon: CreditCard,
      title: 'Processing and Payout', 
      description: 'Collected waste is responsibly recycled; commissions and rewards are distributed to captains and contributors promptly' 
    }
  ];

  const benefits = [
    { 
      icon: Gift,
      title: 'Incentivized Participation', 
      description: 'Attractive rewards and commissions motivate ongoing recycling, turning eco-friendly actions into tangible gains' 
    },
    { 
      icon: TrendingUp, 
      title: 'Reduced Logistics Costs', 
      description: 'By consolidating collections into monthly bulk pickups, we minimize transportation expenses and environmental footprint' 
    },
    { 
      icon: Users, 
      title: 'Community Building', 
      description: 'Strengthens local bonds through shared goals, events, and education, raising awareness about sustainability' 
    },
    { 
      icon: Shield, 
      title: 'Scalable Model', 
      description: 'Easily adaptable from urban neighborhoods to rural areas, allowing for widespread implementation and growth' 
    }
  ];

  const industries = [
    'Residential and Local Communities',
    'Education and Schools',
    'Non-Profits and NGOs',
    'Municipal and Government',
    'Events and Zero-Waste Initiatives'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-light-green-50 via-green-50 to-teal-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-light-green-100 text-light-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">Community E-Waste Collection Network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Become an <span className="text-light-green-600">EcoCaptain</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                An innovative platform that empowers local communities by designating "Eco Captains" in neighborhoods, societies, or zones to organize and streamline e-waste collection, turning recycling into an accessible, rewarding, and community-driven effort.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-light-green-600 text-white rounded-lg font-semibold hover:bg-light-green-700 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  Join as EcoCaptain
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-light-green-600 border-2 border-light-green-600 rounded-lg font-semibold hover:bg-light-green-50 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end order-first lg:order-last">
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-none">
                <div className="absolute inset-0 bg-light-green-600 rounded-2xl sm:rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative bg-gradient-to-br from-light-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl flex items-center justify-center">
                  <img src="/image.png" alt="EcoCaptain" className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">About EcoCaptain</h2>
            <div className="w-16 sm:w-24 h-1 bg-light-green-600 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              EcoCaptain is a community-focused initiative designed to make e-waste recycling simple and impactful. By appointing verified local leaders as "Eco Captains," we enable residents to coordinate collections, promote participation, and earn rewards. This network fosters environmental responsibility at the grassroots level, ensuring that electronic waste is handled ethically and efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Key Features</h2>
            <div className="w-16 sm:w-24 h-1 bg-light-green-600 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Powerful tools to manage your community's e-waste collection effectively
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="bg-light-green-100 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-light-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
            <div className="w-16 sm:w-24 h-1 bg-light-green-600 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              A simple 4-step process to transform your community's e-waste management
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index}>
                  <div className="bg-gradient-to-br from-light-green-50 to-green-50 rounded-xl p-4 sm:p-6 border-2 border-light-green-200 hover:border-light-green-400 transition-colors h-full">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="bg-light-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                        {step.step}
                      </div>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-light-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-light-green-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose EcoCaptain?</h2>
            <div className="w-16 sm:w-24 h-1 bg-light-green-600 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Discover the benefits of our community-driven approach
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-light-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-light-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{benefit.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Perfect For</h2>
            <div className="w-16 sm:w-24 h-1 bg-light-green-600 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Ideal solutions for various sectors and organizations
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {industries.map((industry, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-light-green-300 hover:bg-light-green-50 transition-colors">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-light-green-600 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-r from-light-green-600 to-green-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Ready to Make a Difference?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-light-green-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join thousands of EcoCaptains across the country who are transforming their communities through responsible e-waste management.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-light-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base sm:text-lg w-full sm:w-auto"
            >
              Become an EcoCaptain
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-base sm:text-lg w-full sm:w-auto"
            >
              Already a Member? Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
