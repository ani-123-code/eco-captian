import { useState, useEffect } from 'react';
import { captainsAPI, Profile } from '../../lib/api';
import { UserPlus, Edit2, Trash2, Mail, Loader2, X, CheckCircle2 } from 'lucide-react';

export function CaptainManagement() {
  const [captains, setCaptains] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCaptains();
    
    // Refresh captains list every 10 seconds for real-time updates
    const interval = setInterval(() => {
      loadCaptains();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadCaptains = async () => {
    try {
      const data = await captainsAPI.getAll();
      // Normalize the data structure
      const normalizedCaptains = data.map((captain: any) => ({
        ...captain,
        id: captain._id || captain.id,
        full_name: captain.full_name || '',
        locality: captain.locality || '',
        society: captain.society || '',
        phone: captain.phone || '',
        upi_id: captain.upi_id || '',
        address: captain.address || '',
        balance: captain.balance || 0,
        created_at: captain.createdAt || captain.created_at,
        updated_at: captain.updatedAt || captain.updated_at,
      }));
      setCaptains(normalizedCaptains);
    } catch (err: any) {
      console.error('Error loading captains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (captain?: Profile) => {
    if (captain) {
      setEditingCaptain(captain);
      setFormData({
        email: captain.email || '',
        password: '', // Don't pre-fill password
        full_name: captain.full_name || '',
        locality: captain.locality || '',
        society: captain.society || '',
        phone: captain.phone || '',
        upi_id: captain.upi_id || '',
        address: captain.address || '',
      });
    } else {
      setEditingCaptain(null);
      setFormData({ email: '', password: '', full_name: '', locality: '', society: '', phone: '', upi_id: '', address: '' });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCaptain(null);
    setFormData({ email: '', password: '', full_name: '', locality: '', society: '', phone: '', upi_id: '', address: '' });
    setError('');
    setSuccess('');
  };

  const handleCreateCaptain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

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

      setSuccess('✅ Captain created successfully! Credentials have been sent via email.');
      handleCloseModal();
      // Immediate refresh
      await loadCaptains();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create captain');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCaptain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaptain) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const updateData: any = {
        full_name: formData.full_name,
        locality: formData.locality,
        society: formData.society,
        phone: formData.phone,
        upi_id: formData.upi_id,
        address: formData.address,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await captainsAPI.update(editingCaptain.id, updateData);

      setSuccess('✅ Captain updated successfully!');
      handleCloseModal();
      // Immediate refresh
      await loadCaptains();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update captain');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCaptain = async (captainId: string) => {
    if (!confirm('Are you sure you want to delete this captain? This action cannot be undone.')) {
      return;
    }

    try {
      await captainsAPI.delete(captainId);

      setSuccess('Captain deleted successfully');
      setError('');
      await loadCaptains();
    } catch (err: any) {
      setError(err.message || 'Failed to delete captain');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Captain Management</h2>
          <p className="text-gray-600 mt-1">Manage captain accounts, permissions, and details</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-light-green-600 to-light-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 hover:from-light-green-700 hover:to-light-green-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-semibold">Add Captain</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
          <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-light-green-50 border-l-4 border-light-green-500 text-light-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Success!</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {captains.map((captain) => (
          <div key={captain.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-light-green-100 p-2 rounded-lg flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-light-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{captain.full_name || 'N/A'}</h3>
                  <p className="text-sm text-gray-600 truncate">{captain.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => handleOpenModal(captain)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Captain"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCaptain(captain.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Captain"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Locality</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {captain.locality || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Society</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {captain.society || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Phone</p>
                <p className="text-gray-900">{captain.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Balance</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-light-green-100 text-light-green-700">
                  ₹{captain.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">UPI ID</p>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {captain.upi_id || <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Joined</p>
                <p className="text-gray-900 text-sm">
                  {new Date(captain.created_at || captain.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {captains.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No captains found</p>
            <p className="text-sm">Create your first captain to get started.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Society
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UPI ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {captains.map((captain) => (
              <tr key={captain.id} className="hover:bg-light-green-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-light-green-100 p-2 rounded-lg">
                      <UserPlus className="w-4 h-4 text-light-green-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {captain.full_name || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{captain.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {captain.locality || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {captain.society || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{captain.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono max-w-xs truncate">
                    {captain.upi_id || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-light-green-100 text-light-green-700">
                    ₹{captain.balance?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(captain.created_at || captain.createdAt || '').toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(captain)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Captain"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCaptain(captain.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Captain"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {captains.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No captains found. Create your first captain to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCaptain ? '✏️ Edit Captain' : '➕ Create New Captain'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCaptain ? 'Update captain information' : 'Add a new captain to the system'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingCaptain ? handleUpdateCaptain : handleCreateCaptain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingCaptain}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent ${
                    editingCaptain ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {editingCaptain && (
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingCaptain && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingCaptain}
                  minLength={editingCaptain ? 0 : 6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder={editingCaptain ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="e.g., Andheri West"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Society/Area
                </label>
                <input
                  type="text"
                  value={formData.society}
                  onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="e.g., Green Valley Society"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="yourname@paytm"
                />
                <p className="mt-1 text-xs text-gray-500">Optional - Captain can update this later</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  placeholder="Full address including street, city, state, pincode"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingCaptain ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCaptain ? 'Update Captain' : 'Create Captain'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
