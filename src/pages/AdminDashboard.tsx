import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CaptainManagement } from '../components/admin/CaptainManagement';
import { EwasteManagement } from '../components/admin/EwasteManagement';
import { Analytics } from '../components/admin/Analytics';
import { RegistrationManagement } from '../components/admin/RegistrationManagement';
import { Users, Recycle, BarChart3, LogOut, Menu, X, UserPlus } from 'lucide-react';

type Tab = 'analytics' | 'ewaste' | 'captains' | 'registrations';

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const tabs = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'ewaste' as Tab, label: 'E-Waste', icon: Recycle },
    { id: 'captains' as Tab, label: 'Captains', icon: Users },
    { id: 'registrations' as Tab, label: 'Registrations', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/image.png" alt="EcoCaptain Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">EcoCaptain</h1>
                <p className="text-xs text-gray-600">Admin Dashboard</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-600">{profile?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="space-y-2">
            <div className="pb-2 mb-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-600">{profile?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile tabs - horizontal scroll */}
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-light-green-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:w-64 space-y-2 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-light-green-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'ewaste' && <EwasteManagement />}
            {activeTab === 'captains' && <CaptainManagement />}
            {activeTab === 'registrations' && <RegistrationManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
