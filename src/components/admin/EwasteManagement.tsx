import { useState, useEffect } from 'react';
import { ewasteAPI, EwasteEntry, Profile } from '../../lib/api';
import { MapPin, Calendar, DollarSign, Truck, CheckCircle, Image as ImageIcon, Loader2, ClipboardList, FileText, Edit2, X, Package, Users, Search, Trash2, AlertTriangle } from 'lucide-react';

type EwasteWithCaptain = EwasteEntry & {
  captain: Profile;
};

const STATUS_OPTIONS = [
  'Pending',
  'Reviewed',
  'Priced',
  'Collection Planned',
  'Pickup Scheduled',
  'Collected',
  'Processed',
  'Payment Initiated',
  'Paid',
] as const;

export function EwasteManagement() {
  const [entries, setEntries] = useState<EwasteWithCaptain[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EwasteWithCaptain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<EwasteWithCaptain | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'price' | 'pickup' | 'process' | 'collection' | 'status' | 'notes'>('price');
  const [formData, setFormData] = useState({
    price: '',
    currency: 'INR',
    pickup_date: '',
    pickup_notes: '',
    payment_amount: '',
    collection_date: '',
    collection_time: '',
    collection_notes: '',
    collection_steps: '',
    status: '',
    admin_notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<EwasteWithCaptain | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEntries();

    // Refresh entries every 10 seconds for real-time updates
    const interval = setInterval(() => {
        loadEntries();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadEntries = async () => {
    try {
      const data = await ewasteAPI.getAll();
      // Normalize the data structure and ensure captain is populated
      const normalizedEntries = data.map((entry: any) => {
        const captain = typeof entry.captain_id === 'object' ? entry.captain_id : { email: '', full_name: '' };
        const captainId = typeof entry.captain_id === 'object' 
          ? (entry.captain_id._id || entry.captain_id.id) 
          : entry.captain_id;
        return {
          ...entry,
          id: entry._id || entry.id,
          captain_id: captainId,
          captain: captain,
          created_at: entry.createdAt || entry.created_at,
          updated_at: entry.updatedAt || entry.updated_at,
        };
      });
      setEntries(normalizedEntries);
      setFilteredEntries(normalizedEntries);
    } catch (err: any) {
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = entries.filter((entry) => {
      const description = entry.description?.toLowerCase() || '';
      const captainName = entry.captain?.full_name?.toLowerCase() || '';
      const captainEmail = entry.captain?.email?.toLowerCase() || '';
      const locality = entry.captain?.locality?.toLowerCase() || '';
      const society = entry.captain?.society?.toLowerCase() || '';
      const status = entry.status?.toLowerCase() || '';
      const location = entry.location_address?.toLowerCase() || '';
      const quantity = entry.quantity?.toString() || '';
      const price = entry.price?.toString() || '';
      const paymentAmount = entry.payment_amount?.toString() || '';

      return (
        description.includes(query) ||
        captainName.includes(query) ||
        captainEmail.includes(query) ||
        locality.includes(query) ||
        society.includes(query) ||
        status.includes(query) ||
        location.includes(query) ||
        quantity.includes(query) ||
        price.includes(query) ||
        paymentAmount.includes(query)
      );
    });

    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  const openModal = (entry: EwasteWithCaptain, mode: 'price' | 'pickup' | 'process' | 'collection' | 'status' | 'notes') => {
    setSelectedEntry(entry);
    setModalMode(mode);
    setFormData({
      price: entry.price?.toString() || '',
      currency: entry.currency || 'INR',
      pickup_date: entry.pickup_date ? new Date(entry.pickup_date).toISOString().split('T')[0] : '',
      pickup_notes: entry.pickup_notes || '',
      payment_amount: entry.payment_amount?.toString() || entry.price?.toString() || '',
      collection_date: entry.collection_plan?.collection_date ? new Date(entry.collection_plan.collection_date).toISOString().split('T')[0] : '',
      collection_time: entry.collection_plan?.collection_time || '',
      collection_notes: entry.collection_plan?.collection_notes || '',
      collection_steps: entry.collection_plan?.collection_steps?.join('\n') || '',
      status: entry.status || 'Pending',
      admin_notes: entry.admin_notes || '',
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdatePrice = async () => {
    if (!selectedEntry) return;

    setError('');
    setSuccess('');

    try {
      await ewasteAPI.updatePrice(selectedEntry.id, parseFloat(formData.price), formData.currency);

      setSuccess('✅ Price updated successfully! Email notification sent to captain.');
      setShowModal(false);
      // Immediate refresh
      await loadEntries();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
    }
  };

  const handleSchedulePickup = async () => {
    if (!selectedEntry) return;

    try {
      await ewasteAPI.schedulePickup(
        selectedEntry.id,
        formData.pickup_date,
        formData.pickup_notes
      );

      setSuccess('Pickup scheduled successfully! Email notification sent to captain.');
      setShowModal(false);
      setError('');
      await loadEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule pickup');
      setSuccess('');
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedEntry) return;

    try {
      await ewasteAPI.processPayment(
        selectedEntry.id,
        parseFloat(formData.payment_amount)
      );

      setSuccess('Payment processed successfully! Captain balance updated and email notification sent.');
      setShowModal(false);
      setError('');
      // Immediate refresh
      await loadEntries();
      // Also refresh after a short delay to ensure balance updates are reflected everywhere
      setTimeout(() => {
      loadEntries();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setSuccess('');
    }
  };

  const handlePlanCollection = async () => {
    if (!selectedEntry) return;

    if (!formData.collection_date) {
      setError('Collection date is required');
      return;
    }

    try {
      const steps = formData.collection_steps
        .split('\n')
        .filter(step => step.trim() !== '')
        .map(step => step.trim());

      await ewasteAPI.planCollection(
        selectedEntry.id,
        formData.collection_date,
        formData.collection_time,
        formData.collection_notes,
        steps
      );

      setSuccess('Collection planned successfully! Email notification sent to captain.');
      setShowModal(false);
      setError('');
      // Immediate refresh
      await loadEntries();
      setTimeout(() => {
        loadEntries();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to plan collection');
      setSuccess('');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedEntry) return;

    setError('');
    setSuccess('');

    try {
      const result = await ewasteAPI.updateStatus(
        selectedEntry.id,
        formData.status,
        formData.admin_notes
      );

      // If status was set to "Paid", show special message
      if (formData.status === 'Paid') {
        setSuccess('✅ Status updated to Paid! Payment processed and captain balance updated. Email notification sent.');
      } else {
        setSuccess('✅ Status updated successfully! Email notification sent to captain.');
      }
      setShowModal(false);
      // Immediate refresh
      await loadEntries();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedEntry) return;

    try {
      await ewasteAPI.updateStatus(
        selectedEntry.id,
        selectedEntry.status,
        formData.admin_notes
      );

      setSuccess('Notes updated successfully!');
      setShowModal(false);
      setError('');
      // Immediate refresh
      await loadEntries();
      setTimeout(() => {
        loadEntries();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update notes');
      setSuccess('');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    setError('');
    try {
      await ewasteAPI.delete(deleteConfirm.id);
      setSuccess('E-waste entry deleted successfully!');
      setDeleteConfirm(null);
      await loadEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to delete e-waste entry');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-800',
      'Reviewed': 'bg-blue-100 text-blue-800',
      'Priced': 'bg-indigo-100 text-indigo-800',
      'Collection Planned': 'bg-purple-100 text-purple-800',
      'Pickup Scheduled': 'bg-yellow-100 text-yellow-800',
      'Collected': 'bg-cyan-100 text-cyan-800',
      'Processed': 'bg-light-green-100 text-light-green-800',
      'Payment Initiated': 'bg-orange-100 text-orange-800',
      'Paid': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getNextActions = (status: string) => {
    switch (status) {
      case 'Pending':
        return [
          { label: 'Mark as Reviewed', action: 'status', newStatus: 'Reviewed' },
          { label: 'Set Price', action: 'price' },
        ];
      case 'Reviewed':
        return [
          { label: 'Set Price', action: 'price' },
        ];
      case 'Priced':
        return [
          { label: 'Plan Collection', action: 'collection' },
        ];
      case 'Collection Planned':
        return [
          { label: 'Schedule Pickup', action: 'pickup' },
        ];
      case 'Pickup Scheduled':
        return [
          { label: 'Mark as Collected', action: 'status', newStatus: 'Collected' },
        ];
      case 'Collected':
        return [
          { label: 'Mark as Processed', action: 'status', newStatus: 'Processed' },
        ];
      case 'Processed':
        return [
          { label: 'Initiate Payment', action: 'status', newStatus: 'Payment Initiated' },
        ];
      case 'Payment Initiated':
        return [
          { label: 'Process Payment', action: 'process' },
        ];
      default:
        return [];
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
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">E-Waste Management</h2>
        <p className="text-gray-600 mt-1">View and manage all e-waste submissions</p>
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by description, captain name, email, status, location, quantity, price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {filteredEntries.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? 'No results found' : 'No e-waste entries found'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search query' : 'E-waste entries will appear here once submitted'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{entry.description}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Captain:</span> {entry.captain?.full_name || entry.captain?.email || 'Unknown'}
                      {entry.captain?.locality && ` • ${entry.captain.locality}`}
                      {entry.captain?.society && ` • ${entry.captain.society}`}
                    </p>
                    {entry.captain?.upi_id && (
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        UPI: {entry.captain.upi_id}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Quantity:</span> <span>{typeof entry.quantity === 'number' ? entry.quantity.toFixed(0) : entry.quantity} unit{parseInt(entry.quantity?.toString() || '1') !== 1 ? 's' : ''}</span>
                  </div>
                  {entry.created_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Uploaded: {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  {entry.location_address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{entry.location_address}</span>
                    </div>
                  )}
                  {entry.google_location_link && (
                    <div className="flex items-start gap-2 text-sm text-blue-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <a 
                        href={entry.google_location_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800 break-words"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  )}
                  {entry.price && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-light-green-600">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>Price: ₹{entry.price.toFixed(2)}</span>
                      {!entry.payment_amount && (
                        <span className="text-xs text-gray-500 font-normal">(Pending)</span>
                      )}
                    </div>
                  )}
                  {entry.collection_plan?.collection_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">Collection: {new Date(entry.collection_plan.collection_date).toLocaleDateString()}
                        {entry.collection_plan.collection_time && ` at ${entry.collection_plan.collection_time}`}
                      </span>
                    </div>
                  )}
                  {entry.payment_amount && (
                    <div className="flex items-center gap-2 text-sm text-light-green-600 font-semibold">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>Payment: ₹{entry.payment_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {entry.pickup_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Pickup: {new Date(entry.pickup_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {entry.collection_plan?.collection_steps && entry.collection_plan.collection_steps.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm font-semibold text-purple-800 mb-2">Collection Steps:</p>
                    <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                      {entry.collection_plan.collection_steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.collection_plan?.collection_notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Collection Notes:</strong> {entry.collection_plan.collection_notes}
                    </p>
                  </div>
                )}
                {entry.pickup_notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Pickup Notes:</strong> {entry.pickup_notes}
                    </p>
                  </div>
                )}
                {entry.admin_notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-gray-800">
                      <strong>Admin Notes:</strong> {entry.admin_notes}
                    </p>
                  </div>
                )}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {entry.photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={photo}
                          alt={`E-waste ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                  {getNextActions(entry.status).map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (action.action === 'status' && action.newStatus) {
                          setFormData(prev => ({ ...prev, status: action.newStatus! }));
                          openModal(entry, 'status');
                        } else {
                          openModal(entry, action.action as any);
                        }
                      }}
                      className={`px-4 py-2 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                        action.action === 'price' ? 'bg-indigo-600 hover:bg-indigo-700' :
                        action.action === 'collection' ? 'bg-purple-600 hover:bg-purple-700' :
                        action.action === 'pickup' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        action.action === 'process' ? 'bg-light-green-600 hover:bg-light-green-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {action.action === 'price' && <DollarSign className="w-4 h-4" />}
                      {action.action === 'collection' && <ClipboardList className="w-4 h-4" />}
                      {action.action === 'pickup' && <Truck className="w-4 h-4" />}
                      {action.action === 'process' && <CheckCircle className="w-4 h-4" />}
                      {action.action === 'status' && <CheckCircle className="w-4 h-4" />}
                      <span className="whitespace-nowrap">{action.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => openModal(entry, 'status')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="whitespace-nowrap">Update Status</span>
                  </button>
                  <button
                    onClick={() => openModal(entry, 'notes')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="whitespace-nowrap">Add Notes</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(entry)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="whitespace-nowrap">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete E-Waste Entry</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this e-waste entry?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{deleteConfirm.description}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {deleteConfirm.captain?.full_name || deleteConfirm.captain?.email || 'Unknown Captain'} • {deleteConfirm.status}
                </p>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setError('');
                }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'price' && '💰 Set Price'}
                  {modalMode === 'pickup' && '🚚 Schedule Pickup'}
                  {modalMode === 'process' && '💳 Process Payment'}
                  {modalMode === 'collection' && '📋 Plan Collection'}
                  {modalMode === 'status' && '🔄 Update Status'}
                  {modalMode === 'notes' && '📝 Add Admin Notes'}
            </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modalMode === 'price' && 'Set the price for this e-waste entry'}
                  {modalMode === 'pickup' && 'Schedule when to pick up the e-waste'}
                  {modalMode === 'process' && 'Process payment to captain'}
                  {modalMode === 'collection' && 'Plan collection details and steps'}
                  {modalMode === 'status' && 'Update the status of this entry'}
                  {modalMode === 'notes' && 'Add internal notes for this entry'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-light-green-50 to-blue-50 border border-light-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-light-green-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-light-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{selectedEntry.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {typeof selectedEntry.quantity === 'number' ? selectedEntry.quantity.toFixed(1) : selectedEntry.quantity} kg
                    </span>
                    {selectedEntry.captain?.full_name && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {selectedEntry.captain.full_name}
                      </span>
                    )}
                    {selectedEntry.price && (
                      <span className="flex items-center gap-1 text-light-green-600 font-semibold">
                        <DollarSign className="w-3 h-3" />
                        ₹{selectedEntry.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {modalMode === 'price' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePrice}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Price
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'pickup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.pickup_notes}
                    onChange={(e) => setFormData({ ...formData, pickup_notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Driver name, instructions, etc."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedulePickup}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'process' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Payment will be processed manually outside the website. Use this to mark the payment status.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.payment_amount}
                    onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Enter payment amount"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Captain UPI: <span className="font-mono">{selectedEntry.captain?.upi_id || 'Not set'}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={async () => {
                      if (!selectedEntry || !formData.payment_amount) {
                        setError('Payment amount is required');
                        return;
                      }
                      try {
                        // Mark as payment processing
                        await ewasteAPI.processPayment(selectedEntry.id, parseFloat(formData.payment_amount), true);
                        setSuccess('Payment status set to "Payment Processing". Process payment externally and then mark as "Paid".');
                        setShowModal(false);
                        setError('');
                        await loadEntries();
                      } catch (err: any) {
                        setError(err.message || 'Failed to update payment status');
                      }
                    }}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Payment Processing
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="w-full px-4 py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors font-semibold"
                  >
                    ✓ Mark as Paid (Update Balance)
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  After processing payment externally, click "Mark as Paid" to update captain's balance.
                </p>
              </div>
            )}

            {modalMode === 'collection' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Date *
                  </label>
                  <input
                    type="date"
                    value={formData.collection_date}
                    onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Time
                  </label>
                  <input
                    type="time"
                    value={formData.collection_time}
                    onChange={(e) => setFormData({ ...formData, collection_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Notes
                  </label>
                  <textarea
                    value={formData.collection_notes}
                    onChange={(e) => setFormData({ ...formData, collection_notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Driver details, vehicle number, special instructions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Steps (one per line)
                  </label>
                  <textarea
                    value={formData.collection_steps}
                    onChange={(e) => setFormData({ ...formData, collection_steps: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Step 1: Contact captain&#10;Step 2: Collect e-waste&#10;Step 3: Verify items..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter each step on a new line</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlanCollection}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Plan Collection
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'status' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Add any notes about this status update..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                    placeholder="Add notes about this e-waste entry..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateNotes}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
