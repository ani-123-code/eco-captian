import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ewasteAPI, paymentsAPI, profileAPI, uploadAPI, EwasteEntry, Payment } from '../lib/api';
import { Upload, History, DollarSign, LogOut, Recycle, MapPin, Calendar, Loader2, X, Image as ImageIcon, CreditCard, Edit2, Check, X as XIcon, ChevronDown, ChevronUp, Eye, EyeOff, Package, Search, Plus, Minus, Laptop, Smartphone, Monitor, HardDrive, Tv, Radio, Headphones, Printer, Camera } from 'lucide-react';

type Tab = 'upload' | 'history' | 'payments' | 'profile';

function CaptainDashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const { profile, signOut, refreshProfile } = useAuth();
  const [entries, setEntries] = useState<EwasteEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EwasteEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const productCategories = [
    { value: 'Laptop', label: 'Laptop', icon: Laptop },
    { value: 'Desktop Computer', label: 'Desktop Computer', icon: Monitor },
    { value: 'Mobile Phone', label: 'Mobile Phone', icon: Smartphone },
    { value: 'Tablet', label: 'Tablet', icon: Smartphone },
    { value: 'Monitor', label: 'Monitor', icon: Monitor },
    { value: 'Keyboard', label: 'Keyboard', icon: Laptop },
    { value: 'Mouse', label: 'Mouse', icon: Laptop },
    { value: 'Printer', label: 'Printer', icon: Printer },
    { value: 'Scanner', label: 'Scanner', icon: Printer },
    { value: 'Hard Drive', label: 'Hard Drive', icon: HardDrive },
    { value: 'SSD', label: 'SSD', icon: HardDrive },
    { value: 'RAM', label: 'RAM', icon: HardDrive },
    { value: 'Motherboard', label: 'Motherboard', icon: HardDrive },
    { value: 'Processor/CPU', label: 'Processor/CPU', icon: HardDrive },
    { value: 'TV', label: 'TV', icon: Tv },
    { value: 'Camera', label: 'Camera', icon: Camera },
    { value: 'Headphones', label: 'Headphones', icon: Headphones },
    { value: 'Speaker', label: 'Speaker', icon: Radio },
    { value: 'Router', label: 'Router', icon: Radio },
    { value: 'Modem', label: 'Modem', icon: Radio },
    { value: 'Charger', label: 'Charger', icon: Smartphone },
    { value: 'Battery', label: 'Battery', icon: Smartphone },
    { value: 'Cables', label: 'Cables', icon: Radio },
    { value: 'Other', label: 'Other', icon: Package },
  ];

  const [uploadForm, setUploadForm] = useState({
    numberOfItems: '',
    items: [] as Array<{ productType: string; units: string; weight: string; otherProductName?: string }>,
    location_address: '',
  });
  
  // Initialize items array when numberOfItems changes
  const numberOfItems = uploadForm.numberOfItems;
  useEffect(() => {
    const numItems = parseInt(numberOfItems) || 0;
    if (numItems > 0 && numItems <= 20) {
      setUploadForm(prev => {
        const currentItems = prev.items.length;
        if (numItems > currentItems) {
          // Add new items
          const newItems = Array.from({ length: numItems - currentItems }, () => ({
            productType: '',
            units: '',
            weight: '',
            otherProductName: '',
          }));
          return {
            ...prev,
            items: [...prev.items, ...newItems],
          };
        } else if (numItems < currentItems) {
          // Remove excess items
          return {
            ...prev,
            items: prev.items.slice(0, numItems),
          };
        }
        return prev;
      });
    } else if (numItems === 0) {
      setUploadForm(prev => ({ ...prev, items: [] }));
    }
  }, [numberOfItems]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [upiId, setUpiId] = useState('');
  const [editingUPI, setEditingUPI] = useState(false);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeTab === 'history') {
      loadEntries();
    } else if (activeTab === 'payments') {
      loadPayments();
    } else if (activeTab === 'profile') {
      loadProfile();
    }
  }, [activeTab]);

  // Refresh profile balance and payments periodically for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'payments') {
        refreshProfile();
        loadPayments();
      } else if (activeTab === 'profile') {
        refreshProfile();
      } else if (activeTab === 'history') {
        loadEntries();
        refreshProfile(); // Also refresh balance when viewing history
      }
    }, 10000); // Refresh every 10 seconds for real-time updates

    return () => clearInterval(interval);
  }, [activeTab, refreshProfile]);

  const loadProfile = async () => {
    try {
      const data = await profileAPI.getProfile();
      setUpiId(data.upi_id || '');
      // Also refresh the auth context profile
      await refreshProfile();
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  };

  const handleUpdateUPI = async () => {
    if (!upiId.trim()) {
      setUpiError('UPI ID is required');
      return;
    }

    setUpiError('');
    setUpiLoading(true);

    try {
      await profileAPI.updateUPI(upiId.trim());
      setEditingUPI(false);
      setUpiError('');
      // Refresh profile to get updated data
      await refreshProfile();
    } catch (err: any) {
      setUpiError(err.message || 'Failed to update UPI ID');
    } finally {
      setUpiLoading(false);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await ewasteAPI.getAll();
      // Normalize the data structure
      const normalizedEntries = data.map((entry: any) => {
        const captainId = typeof entry.captain_id === 'object' 
          ? (entry.captain_id._id || entry.captain_id.id) 
          : entry.captain_id;
        return {
          ...entry,
          id: entry._id || entry.id,
          captain_id: captainId,
          created_at: entry.createdAt || entry.created_at,
          updated_at: entry.updatedAt || entry.updated_at,
        };
      });
      setEntries(normalizedEntries);
      setFilteredEntries(normalizedEntries);
      // Refresh profile balance when entries are loaded (in case payment was processed)
      refreshProfile();
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
      const status = entry.status?.toLowerCase() || '';
      const location = entry.location_address?.toLowerCase() || '';
      const quantity = entry.quantity?.toString() || '';
      const price = entry.price?.toString() || '';
      const paymentAmount = entry.payment_amount?.toString() || '';
      const pickupDate = entry.pickup_date ? new Date(entry.pickup_date).toLocaleDateString().toLowerCase() : '';
      const collectionDate = entry.collection_plan?.collection_date ? new Date(entry.collection_plan.collection_date).toLocaleDateString().toLowerCase() : '';

      return (
        description.includes(query) ||
        status.includes(query) ||
        location.includes(query) ||
        quantity.includes(query) ||
        price.includes(query) ||
        paymentAmount.includes(query) ||
        pickupDate.includes(query) ||
        collectionDate.includes(query)
      );
    });

    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsAPI.getAll();
      // Normalize the data structure
      const normalizedPayments = data.map((payment: any) => ({
        ...payment,
        id: payment._id || payment.id,
        amount: payment.amount || 0,
        description: payment.description || 'Payment received',
        created_at: payment.createdAt || payment.created_at,
      }));
      setPayments(normalizedPayments);
      // Refresh profile to get updated balance
      await refreshProfile();
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 3) {
      setError('Maximum 3 images allowed. Please remove some images first.');
      e.target.value = '';
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPG, PNG, GIF, etc.)');
      e.target.value = '';
      return;
    }

    // Validate file sizes (max 10MB)
    const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setError('File size must be less than 10MB. Please select smaller images.');
      e.target.value = '';
      return;
    }

    setError('');

    // Add files to selected files
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Initialize uploading and URL arrays
    const newUploading = [...uploadingImages, ...Array(files.length).fill(true)];
    const newUrls = [...uploadedImageUrls, ...Array(files.length).fill('')];
    setUploadingImages(newUploading);
    setUploadedImageUrls(newUrls);

    try {
      // Upload files to S3 and get CloudFront URLs
      const result = await uploadAPI.uploadMultipleImages(files, 'ecocaptian');
      
      // Update URLs for the newly uploaded files
      const updatedUrls = [...uploadedImageUrls];
      const startIndex = uploadedImageUrls.length;
      result.urls.forEach((url: string, index: number) => {
        updatedUrls[startIndex + index] = url;
      });
      setUploadedImageUrls(updatedUrls);

      // Update uploading status
      const updatedUploading = [...uploadingImages];
      files.forEach((_, index) => {
        updatedUploading[startIndex + index] = false;
      });
      setUploadingImages(updatedUploading);

      console.log('✅ Images uploaded successfully:', result.urls);
    } catch (err: any) {
      console.error('❌ Image upload error:', err);
      setError(err.message || 'Failed to upload images. Please try again.');
      
      // Remove failed files
      const failedCount = files.length;
      setSelectedFiles(selectedFiles);
      setUploadedImageUrls(uploadedImageUrls);
      setUploadingImages(uploadingImages.slice(0, -failedCount));
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
    setUploadingImages(uploadingImages.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productType' | 'units' | 'weight' | 'otherProductName', value: string) => {
    setUploadForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Clear otherProductName when productType changes to something other than "Other"
          if (field === 'productType' && value !== 'Other') {
            updatedItem.otherProductName = '';
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate number of items
    const numItems = parseInt(uploadForm.numberOfItems);
    if (!numItems || numItems < 1 || numItems > 20) {
      setError('Please enter a valid number of items (1-20)');
      return;
    }

    // Validate all items are filled
    const invalidItems = uploadForm.items.filter(
      item => {
        if (!item.productType.trim() || !item.units || parseInt(item.units) <= 0) {
          return true;
        }
        // Validate weight
        if (!item.weight || parseFloat(item.weight) <= 0) {
          return true;
        }
        // If "Other" is selected, validate that otherProductName is filled
        if (item.productType === 'Other' && !item.otherProductName?.trim()) {
          return true;
        }
        return false;
      }
    );
    if (invalidItems.length > 0) {
      setError('Please fill in all product types, units, weight (kg), and custom product names (if "Other" is selected)');
      return;
    }

    // Check if all images are uploaded
    const pendingUploads = uploadingImages.some(loading => loading);
    if (pendingUploads) {
      setError('Please wait for all images to finish uploading');
      return;
    }

    // Filter out empty URLs (failed uploads)
    const validImageUrls = uploadedImageUrls.filter(url => url && url.trim() !== '');
    if (validImageUrls.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setUploadLoading(true);

    try {
      // Build description from items (includes weight)
      const description = uploadForm.items
        .map(item => {
          const productName = item.productType === 'Other' && item.otherProductName?.trim() 
            ? item.otherProductName.trim() 
            : item.productType;
          return `${item.units} ${productName}${parseInt(item.units) > 1 ? 's' : ''} (${item.weight} kg)`;
        })
        .join(', ');
      
      // Calculate total quantity (units)
      const totalQuantity = uploadForm.items.reduce(
        (sum, item) => sum + parseInt(item.units || '0'),
        0
      ).toString();
      
      // Calculate total weight (kg)
      const totalWeight = uploadForm.items.reduce(
        (sum, item) => sum + parseFloat(item.weight || '0'),
        0
      ).toFixed(2);

      // Submit with CloudFront URLs (not files)
      const result = await ewasteAPI.create({
        description: description.trim(),
        quantity: totalQuantity,
        location_address: uploadForm.location_address.trim() || undefined,
        photos: validImageUrls, // Send CloudFront URLs
      });

      setSuccess('E-waste uploaded successfully! Admin will review and price it soon.');
      setUploadForm({ numberOfItems: '', items: [], location_address: '' });
      setSelectedFiles([]);
      setUploadedImageUrls([]);
      setUploadingImages([]);
      setError('');
      
      // Refresh entries if on history tab
      if (activeTab === 'history') {
        setTimeout(() => loadEntries(), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload e-waste. Please try again.');
    } finally {
      setUploadLoading(false);
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

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload E-Waste', icon: Upload },
    { id: 'history' as Tab, label: 'My E-Waste', icon: History },
    { id: 'payments' as Tab, label: 'Payments', icon: DollarSign },
    { id: 'profile' as Tab, label: 'Profile', icon: CreditCard },
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
                <p className="text-xs text-gray-600">Captain Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Captain'}</p>
                <p className="text-xs text-light-green-600 font-semibold">Balance: ₹{profile?.balance.toFixed(2)}</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-light-green-50 border border-light-green-200 rounded-lg p-4 mb-6 md:hidden">
            <p className="text-sm text-light-green-800">
              <strong>Current Balance:</strong> ₹{profile?.balance.toFixed(2)}
            </p>
        </div>

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
                      ? 'bg-light-green-600 text-white shadow-md'
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
                      ? 'bg-light-green-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1">
            {activeTab === 'upload' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload E-Waste</h2>
                  <p className="text-gray-600">Submit your e-waste for collection and payment. Fill in the details below.</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-light-green-50 border-l-4 border-light-green-500 text-light-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Success!</p>
                      <p className="text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Number of Items */}
                  <div className="bg-gradient-to-br from-light-green-50 to-green-50 rounded-lg p-4 sm:p-6 border-2 border-light-green-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Number of Different Items <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      How many different types of e-waste items do you have? (e.g., if you have laptops, phones, and monitors, enter 3)
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={uploadForm.numberOfItems}
                      onChange={(e) => setUploadForm({ ...uploadForm, numberOfItems: e.target.value })}
                      required
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white text-lg font-semibold"
                      placeholder="e.g., 3"
                    />
                    {uploadForm.numberOfItems && parseInt(uploadForm.numberOfItems) > 0 && (
                      <p className="text-sm text-light-green-700 mt-2 font-medium">
                        ✓ You'll add {uploadForm.numberOfItems} item{parseInt(uploadForm.numberOfItems) > 1 ? 's' : ''} below
                      </p>
                    )}
                  </div>

                  {/* Step 2: Product Items */}
                  {uploadForm.items.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-light-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">Add Product Details</h3>
                      </div>
                      {uploadForm.items.map((item, index) => {
                        const category = productCategories.find(cat => cat.value === item.productType);
                        const Icon = category?.icon || Package;
                        return (
                          <div key={index} className="bg-white rounded-lg p-4 sm:p-5 border-2 border-gray-200 hover:border-light-green-300 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-light-green-100 rounded-full p-2">
                                  <Icon className="w-4 h-4 text-light-green-600" />
                                </div>
                                <span className="font-semibold text-gray-900">Item {index + 1}</span>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Product Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={item.productType}
                                  onChange={(e) => handleItemChange(index, 'productType', e.target.value)}
                                  required
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white"
                                >
                                  <option value="">Select product type...</option>
                                  {productCategories.map((cat) => {
                                    const CatIcon = cat.icon;
                                    return (
                                      <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </option>
                                    );
                                  })}
                                </select>
                                {item.productType === 'Other' && (
                                  <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Specify Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={item.otherProductName || ''}
                                      onChange={(e) => handleItemChange(index, 'otherProductName', e.target.value)}
                                      required
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white"
                                      placeholder="e.g., Gaming Console, Smart Watch, etc."
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Units <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.units}
                                    onChange={(e) => handleItemChange(index, 'units', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white"
                                    placeholder="e.g., 10"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={item.weight}
                                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white"
                                    placeholder="e.g., 5.5"
                                  />
                                </div>
                              </div>
                              <div className="bg-light-green-50 rounded-lg p-3 border border-light-green-200">
                                <p className="text-xs sm:text-sm text-gray-700">
                                  <span className="font-semibold">Summary:</span>{' '}
                                  {(() => {
                                    const productName = item.productType === 'Other' && item.otherProductName?.trim()
                                      ? item.otherProductName.trim()
                                      : item.productType || 'items';
                                    return item.productType && item.units && item.weight
                                      ? `${item.units} ${productName}${parseInt(item.units || '0') > 1 ? 's' : ''} • ${item.weight} kg`
                                      : 'Fill in details above';
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Location Address */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Location Address
                    </label>
                    <p className="text-xs text-gray-500 mb-3">Pickup location (optional)</p>
                    <input
                      type="text"
                      value={uploadForm.location_address}
                      onChange={(e) => setUploadForm({ ...uploadForm, location_address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-light-green-500 transition-all bg-white"
                      placeholder="123 Main St, City, State"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">
                          Photos
                        </label>
                        <p className="text-xs text-gray-500">
                          Upload up to 3 images • Max 10MB per image
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedFiles.length === 3 
                          ? 'bg-light-green-100 text-light-green-700' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {selectedFiles.length}/3
                      </span>
                    </div>
                    
                    {selectedFiles.length < 3 && (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-light-green-400 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="bg-light-green-50 p-3 rounded-full mb-3 group-hover:bg-light-green-100 transition-colors">
                            <ImageIcon className="w-8 h-8 text-light-green-600" />
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            <span className="font-semibold text-light-green-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                        <input
                          type="file"
                          onChange={handleImageUpload}
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={uploadLoading}
                        />
                      </label>
                    )}
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                              {uploadedImageUrls[idx] ? (
                                <img
                                  src={uploadedImageUrls[idx]}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to blob URL if CloudFront URL fails
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== URL.createObjectURL(file)) {
                                      target.src = URL.createObjectURL(file);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              {uploadingImages[idx] && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
                                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                  <p className="text-xs text-white">Uploading...</p>
                                </div>
                              )}
                              
                              {uploadedImageUrls[idx] && !uploadingImages[idx] && (
                                <div className="absolute top-2 left-2 bg-light-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Uploaded
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                disabled={uploadingImages[idx]}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-xs text-white truncate">{file.name}</p>
                                <p className="text-xs text-white/80">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                  {uploadedImageUrls[idx] && ' • CloudFront'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadForm({ numberOfItems: '', items: [], location_address: '' });
                        setSelectedFiles([]);
                        setUploadedImageUrls([]);
                        setUploadingImages([]);
                        setError('');
                        setSuccess('');
                      }}
                      disabled={uploadLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={
                        uploadLoading ||
                        !uploadForm.numberOfItems ||
                        uploadForm.items.length === 0 ||
                        uploadForm.items.some(item => 
                          !item.productType || 
                          !item.units ||
                          (item.productType === 'Other' && !item.otherProductName?.trim())
                        ) ||
                        selectedFiles.length === 0
                      }
                      className="flex-1 bg-light-green-600 text-white py-3 rounded-lg font-semibold hover:bg-light-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Submit E-Waste
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My E-Waste Submissions</h2>
                  <p className="text-gray-600">Track the status of your e-waste submissions</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by description, status, location, quantity, price..."
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

                {loading ? (
                  <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
                    <Loader2 className="w-8 h-8 text-light-green-600 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {filteredEntries.length === 0 ? (
                      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">
                          {searchQuery ? 'No results found' : 'No e-waste submissions yet'}
                        </p>
                        <p className="text-sm">
                          {searchQuery ? 'Try adjusting your search query' : 'Upload your first e-waste submission to get started'}
                        </p>
                      </div>
                    ) : (
                      filteredEntries.map((entry) => {
                      const isExpanded = expandedEntries.has(entry.id);
                      const hasDetails = entry.collection_plan?.collection_steps?.length > 0 || 
                                        entry.collection_plan?.collection_notes || 
                                        entry.pickup_notes || 
                                        (entry.photos && entry.photos.length > 0);
                      
                      return (
                        <div key={entry.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className="p-4 sm:p-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{entry.description}</h3>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="font-medium">{typeof entry.quantity === 'number' ? entry.quantity.toFixed(0) : entry.quantity} unit{parseInt(entry.quantity?.toString() || '1') !== 1 ? 's' : ''}</span>
                                  </span>
                                  {entry.price && (
                                    <span className="text-light-green-600 font-semibold flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                      ₹{entry.price.toFixed(2)}
                                    </span>
                                  )}
                                  {entry.payment_amount && (
                                    <span className="text-light-green-600 font-semibold flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {entry.status === 'Payment Initiated' ? 'Processing: ' : 'Paid: '}₹{entry.payment_amount.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                {entry.created_at && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Uploaded: {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(entry.status)}`}>
                                  {entry.status}
                                </span>
                                {hasDetails && (
                                  <button
                                    onClick={() => {
                                      setExpandedEntries(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(entry.id)) {
                                          newSet.delete(entry.id);
                                        } else {
                                          newSet.add(entry.id);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <EyeOff className="w-4 h-4" />
                                        <span className="hidden sm:inline">Hide</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">View</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Basic info always visible */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                              {entry.location_address && (
                                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{entry.location_address}</span>
                                </div>
                              )}
                              {entry.collection_plan?.collection_date && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span>Collection: {new Date(entry.collection_plan.collection_date).toLocaleDateString()}
                                    {entry.collection_plan.collection_time && ` at ${entry.collection_plan.collection_time}`}
                                  </span>
                                </div>
                              )}
                              {entry.pickup_date && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span>Pickup: {new Date(entry.pickup_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {entry.status === 'Payment Initiated' && (
                                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded sm:col-span-2">
                                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                                  <span>Payment being processed</span>
                                </div>
                              )}
                            </div>

                            {/* Detailed info - only shown when expanded */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                {entry.collection_plan?.collection_steps && entry.collection_plan.collection_steps.length > 0 && (
                                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                                    <p className="text-sm font-semibold text-purple-800 mb-2">Collection Steps:</p>
                                    <ul className="list-disc list-inside text-xs sm:text-sm text-purple-700 space-y-1">
                                      {entry.collection_plan.collection_steps.map((step: string, idx: number) => (
                                        <li key={idx}>{step}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {entry.collection_plan?.collection_notes && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm text-blue-800">
                                      <strong>Collection Notes:</strong> {entry.collection_plan.collection_notes}
                                    </p>
                                  </div>
                                )}
                                {entry.pickup_notes && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm text-yellow-800">
                                      <strong>Pickup Notes:</strong> {entry.pickup_notes}
                                    </p>
                                  </div>
                                )}

                                {entry.photos && entry.photos.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Photos:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {entry.photos.map((photo, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group cursor-pointer">
                                          <img
                                            src={photo}
                                            alt={`E-waste ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h2>
                  <p className="text-gray-600">View all your earnings and payments</p>
                </div>

                <div className="bg-gradient-to-br from-light-green-500 to-light-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-light-green-100 text-sm font-medium mb-1">Current Balance</p>
                      <p className="text-4xl font-bold">₹{profile?.balance?.toFixed(2) || '0.00'}</p>
                      <p className="text-light-green-100 text-xs mt-2">Available for withdrawal</p>
                      {payments.some(p => p.status === 'Pending' || p.status === 'Processing') && (
                        <p className="text-light-green-100 text-xs mt-1">
                          {payments.filter(p => p.status === 'Pending' || p.status === 'Processing').length} pending payment(s)
                        </p>
                      )}
                    </div>
                    <div className="bg-white/20 p-4 rounded-full">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                    <Loader2 className="w-8 h-8 text-light-green-600 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {payments.map((payment) => {
                        const isCompleted = payment.status === 'Completed' || !payment.status;
                        const isPending = payment.status === 'Pending';
                        const isProcessing = payment.status === 'Processing';
                        
                        return (
                          <div key={payment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                  isCompleted ? 'bg-light-green-100' : 
                                  isProcessing ? 'bg-orange-100' : 
                                  'bg-gray-100'
                                }`}>
                                  <DollarSign className={`w-5 h-5 ${
                                    isCompleted ? 'text-light-green-600' : 
                                    isProcessing ? 'text-orange-600' : 
                                    'text-gray-600'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{payment.description || 'Payment received'}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(payment.created_at || payment.createdAt || '').toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })} at {new Date(payment.created_at || payment.createdAt || '').toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0 ml-2 ${
                                isCompleted ? 'bg-light-green-100 text-light-green-700' :
                                isProcessing ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {isCompleted ? '+' : ''}₹{payment.amount.toFixed(2)}
                              </span>
                            </div>
                            {(isPending || isProcessing) && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                {isPending && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    Pending
                                  </span>
                                )}
                                {isProcessing && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Processing
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {payments.length === 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
                          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No payments yet</p>
                          <p className="text-sm">Submit e-waste to start earning!</p>
                        </div>
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment) => {
                            const isCompleted = payment.status === 'Completed' || !payment.status;
                            const isPending = payment.status === 'Pending';
                            const isProcessing = payment.status === 'Processing';
                            
                            return (
                              <tr key={payment.id} className="hover:bg-light-green-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {new Date(payment.created_at || payment.createdAt || '').toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(payment.created_at || payment.createdAt || '').toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded ${
                                      isCompleted ? 'bg-light-green-100' : 
                                      isProcessing ? 'bg-orange-100' : 
                                      'bg-gray-100'
                                    }`}>
                                      <DollarSign className={`w-4 h-4 ${
                                        isCompleted ? 'text-light-green-600' : 
                                        isProcessing ? 'text-orange-600' : 
                                        'text-gray-600'
                                      }`} />
                                    </div>
                                    <div className="flex-1">
                                      <span>{payment.description || 'Payment received'}</span>
                                      {isPending && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                          Pending
                                        </span>
                                      )}
                                      {isProcessing && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Processing
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                    isCompleted ? 'bg-light-green-100 text-light-green-700' :
                                    isProcessing ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {isCompleted ? '+' : ''}₹{payment.amount.toFixed(2)}
                                    {!isCompleted && <span className="ml-1 text-xs">(pending)</span>}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                            {payments.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                  <div className="flex flex-col items-center">
                                    <DollarSign className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No payments yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Submit e-waste to start earning!</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
                  <p className="text-gray-600">Manage your personal information and payment details</p>
                </div>

                {upiError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {upiError}
                  </div>
                )}

                {success && (
                  <div className="bg-light-green-50 border border-light-green-200 text-light-green-700 px-4 py-3 rounded-lg mb-4">
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-light-green-50 border border-light-green-200 rounded-lg p-6 mb-6">
                    <p className="text-sm text-light-green-800 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-light-green-900">₹{profile?.balance?.toFixed(2) || '0.00'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profile?.phone || 'Not provided'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locality
                      </label>
                      <input
                        type="text"
                        value={profile?.locality || 'Not assigned'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Society/Area
                      </label>
                      <input
                        type="text"
                        value={profile?.society || 'Not assigned'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profile?.address || 'Not provided'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UPI ID (for payments)
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Update your UPI ID to receive payments directly
                        </p>
                      </div>
                    </div>

                    {editingUPI ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-green-500 focus:border-transparent"
                          placeholder="yourname@paytm"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleUpdateUPI}
                            disabled={upiLoading}
                            className="px-6 py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {upiLoading ? 'Saving...' : 'Save UPI ID'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUPI(false);
                              setUpiError('');
                              setUpiId(profile?.upi_id || '');
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={profile?.upi_id || 'Not set'}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setEditingUPI(true);
                            setUpiId(profile?.upi_id || '');
                            setUpiError('');
                          }}
                          className="ml-4 px-6 py-2 bg-light-green-600 text-white rounded-lg hover:bg-light-green-700 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          {profile?.upi_id ? 'Edit' : 'Add'} UPI ID
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaptainDashboard() {
  return (
    <ProtectedRoute requiredRole="captain">
      <CaptainDashboardContent />
    </ProtectedRoute>
  );
}
