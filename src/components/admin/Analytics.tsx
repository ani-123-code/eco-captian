import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../lib/api';
import { TrendingUp, DollarSign, Users, Recycle, Loader2, Activity, Package, CheckCircle2 } from 'lucide-react';

type AnalyticsData = {
  totalEwaste: number;
  totalPayments: number;
  totalCaptains: number;
  totalWeight: number;
  recentEntries: Array<{
    date: string;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
};

export function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalEwaste: 0,
    totalPayments: 0,
    totalCaptains: 0,
    totalWeight: 0,
    recentEntries: [],
    statusBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 10 seconds for real-time updates
    const interval = setInterval(() => {
      loadAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await analyticsAPI.getAnalytics();
      setData(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-light-green-600 animate-spin" />
      </div>
    );
  }

  const maxCount = Math.max(...data.recentEntries.map(e => e.count), 1);
  const maxStatusCount = Math.max(...data.statusBreakdown.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive overview of platform performance</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-light-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-light-green-500 to-light-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Recycle className="w-6 h-6" />
            </div>
            <Activity className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-light-green-100 text-sm font-medium mb-1">Total E-Waste</p>
          <p className="text-3xl font-bold">{data.totalEwaste}</p>
          <p className="text-light-green-100 text-xs mt-2">Submissions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Weight</p>
          <p className="text-3xl font-bold">{data.totalWeight.toFixed(1)}</p>
          <p className="text-blue-100 text-xs mt-2">Kilograms</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-yellow-100 text-sm font-medium mb-1">Total Payments</p>
          <p className="text-3xl font-bold">₹{data.totalPayments.toFixed(2)}</p>
          <p className="text-yellow-100 text-xs mt-2">Disbursed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <CheckCircle2 className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Active Captains</p>
          <p className="text-3xl font-bold">{data.totalCaptains}</p>
          <p className="text-purple-100 text-xs mt-2">Registered</p>
        </div>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Activity Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Last 7 days submissions</p>
            </div>
            <div className="bg-light-green-100 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-light-green-600" />
            </div>
          </div>
          <div className="space-y-4">
            {data.recentEntries.length > 0 ? (
              data.recentEntries.map((entry, idx) => {
                const percentage = (entry.count / maxCount) * 100;
                return (
                  <div key={entry.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-gray-900 font-bold">{entry.count}</span>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-light-green-400 to-light-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-500 mt-1">Current e-waste status breakdown</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-4">
            {data.statusBreakdown.length > 0 ? (
              data.statusBreakdown.map((item) => {
                const percentage = (item.count / maxStatusCount) * 100;
                const statusColors: Record<string, string> = {
                  'Pending': 'from-gray-400 to-gray-500',
                  'Reviewed': 'from-blue-400 to-blue-500',
                  'Priced': 'from-indigo-400 to-indigo-500',
                  'Collection Planned': 'from-purple-400 to-purple-500',
                  'Pickup Scheduled': 'from-yellow-400 to-yellow-500',
                  'Collected': 'from-cyan-400 to-cyan-500',
                  'Processed': 'from-light-green-400 to-light-green-500',
                  'Payment Initiated': 'from-orange-400 to-orange-500',
                  'Paid': 'from-green-400 to-green-500',
                };
                const gradient = statusColors[item.status] || 'from-gray-400 to-gray-500';
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{item.status}</span>
                      <span className="text-gray-900 font-bold">{item.count}</span>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No status data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-light-green-100 p-2 rounded-lg">
              <Recycle className="w-5 h-5 text-light-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Weight/Entry</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalEwaste > 0 ? (data.totalWeight / data.totalEwaste).toFixed(2) : '0.00'} kg
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Payment/Entry</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{data.totalEwaste > 0 ? (data.totalPayments / data.totalEwaste).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Entries/Captain</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalCaptains > 0 ? (data.totalEwaste / data.totalCaptains).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
