import { useState, useEffect } from 'react';
import { registrationsAPI } from '../../lib/api';
import { UserPlus, Mail, Phone, MapPin, Home, CreditCard, Loader2, X, CheckCircle2, Clock, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { captainsAPI } from '../../lib/api';

type RegistrationRequest = {
  id: string;
  _id?: string;
  full_name: string;
  email: string;
  phone: string;
  locality: string;
  society?: string;
  address?: string;
  upi_id?: string;
  status: 'Pending' | 'Contacted' | 'Approved' | 'Rejected';
  admin_notes?: string;
  created_at?: string;
  createdAt?: string;
};

export function RegistrationManagement() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'status' | 'create'>('view');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    status: 'Pending',
    admin_notes: '',
    email: '',
    password: '',
    full_name: '',
    locality: '',
    society: '',
    phone: '',
    upi_id: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      loadRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const data = await registrationsAPI.getAll(status);
      const normalizedRequests = data.map((req: any) => ({
        ...req,
        id: req._id || req.id,
        created_at: req.createdAt || req.created_at,
      }));
      setRequests(normalizedRequests);
    } catch (err: any) {
      console.error('Error loading registration requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request: RegistrationRequest, mode: 'view' | 'status' | 'create' = 'view') => {
    setSelectedRequest(request);
    setModalMode(mode);
    setFormData({
      status: request.status,
      admin_notes: request.admin_notes || '',
      email: request.email,
      password: '',
      full_name: request.full_name,
      locality: request.locality,
      society: request.society || '',
      phone: request.phone,
      upi_id: request.upi_id || '',
      address: request.address || '',
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setError('');
    setSuccess('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registrationsAPI.updateStatus(selectedRequest.id, formData.status, formData.admin_notes);
      
      if (formData.status === 'Approved') {
        setSuccess('✅ Registration approved! Captain account has been created and credentials have been sent via email.');
      } else {
        setSuccess('✅ Status updated successfully!');
      }
      
      handleCloseModal();
      await loadRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaptain = async () => {
    if (!selectedRequest) return;

    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Email, password, and full name are required');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await captainsAPI.create(
        formData.email,
        formData.password,
        formData.full_name,
        formData.locality,
        formData.society,
        formData.phone,
        formData.upi_id,
        formData.address
      );

      // Update registration request status to Approved
      await registrationsAPI.updateStatus(selectedRequest.id, 'Approved', 'Captain account created successfully');

      setSuccess('✅ Captain created successfully! Credentials have been sent via email.');
      handleCloseModal();
      await loadRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create captain');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration request?')) return;

    try {
      await registrationsAPI.delete(id);
      setSuccess('Registration request deleted successfully!');
      await loadRequests();
      setTimeout(() => {
        loadRequests();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete registration request');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-light-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Registration Requests</h2>
        <p className="text-gray-600">Manage captain registration requests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-light-green-50 border border-light-green-200 text-light-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-light-green-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All ({requests.length})
        </button>
        {['Pending', 'Contacted', 'Approved', 'Rejected'].map((status) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-light-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                  Contact
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Location
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.full_name}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{request.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900">{request.email}</div>
                    <div className="text-xs text-gray-500">{request.phone}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{request.locality}</div>
                    {request.society && (
                      <div className="text-xs text-gray-500">{request.society}</div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(request.created_at || '').toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(request, 'view')}
                        className="text-light-green-600 hover:text-light-green-900 p-1"
                        title="View Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {request.status !== 'Approved' && (
                        <button
                          onClick={() => handleOpenModal(request, 'create')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Create Captain"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No registration requests found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'view' && 'Registration Details'}
                {modalMode === 'status' && 'Update Status'}
                {modalMode === 'create' && 'Create Captain Account'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalMode === 'view' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{selectedRequest.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedRequest.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                      <p className="text-gray-900">{selectedRequest.locality}</p>
                    </div>
                    {selectedRequest.society && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Society</label>
                        <p className="text-gray-900">{selectedRequest.society}</p>
                      </div>
                    )}
                    {selectedRequest.address && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <p className="text-gray-900">{selectedRequest.address}</p>
                      </div>
                    )}
                    {selectedRequest.upi_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <p className="text-gray-900">{selectedRequest.upi_id}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                      <p className="text-gray-900">
                        {new Date(selectedRequest.created_at || '').toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedRequest.admin_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.admin_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setModalMode('status')}
                      className="flex-1 bg-light-green-500 text-white py-2 rounded-lg font-semibold hover:bg-light-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Update Status
                    </button>
                    {selectedRequest.status !== 'Approved' && (
                      <button
                        onClick={() => setModalMode('create')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Captain
                      </button>
                    )}
                  </div>
                </>
              )}

              {modalMode === 'status' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    {formData.status === 'Approved' && (
                      <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Note:</strong> Approving this request will automatically create a captain account and send login credentials via email.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      placeholder="Add notes about this registration request..."
                    />
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={loading}
                    className="w-full bg-light-green-500 text-white py-2 rounded-lg font-semibold hover:bg-light-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </>
              )}

              {modalMode === 'create' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Locality <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Society</label>
                      <input
                        type="text"
                        value={formData.society}
                        onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={formData.upi_id}
                        onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateCaptain}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create Captain Account
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
