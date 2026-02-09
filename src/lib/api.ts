const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || `Login failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Captains API
export const captainsAPI = {
  getAll: async () => {
    return apiRequest('/captains');
  },

  create: async (email: string, password: string, full_name: string, locality?: string, society?: string, phone?: string, upi_id?: string, address?: string) => {
    return apiRequest('/captains', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, locality, society, phone, upi_id, address }),
    });
  },

  update: async (id: string, data: { full_name?: string; locality?: string; society?: string; phone?: string; upi_id?: string; address?: string; password?: string }) => {
    return apiRequest(`/captains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/captains/${id}`, {
      method: 'DELETE',
    });
  },
};

// E-waste API
export const ewasteAPI = {
  getAll: async () => {
    return apiRequest('/ewaste');
  },

  create: async (data: { description: string; quantity: string; location_address?: string; google_location_link?: string; photos: string[] }) => {
    return apiRequest('/ewaste', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePrice: async (id: string, price: number, currency?: string) => {
    return apiRequest(`/ewaste/${id}/price`, {
      method: 'PUT',
      body: JSON.stringify({ price, currency }),
    });
  },

  schedulePickup: async (id: string, pickup_date: string, pickup_notes?: string) => {
    return apiRequest(`/ewaste/${id}/pickup`, {
      method: 'PUT',
      body: JSON.stringify({ pickup_date, pickup_notes }),
    });
  },

  processPayment: async (id: string, payment_amount: number, mark_as_processing?: boolean) => {
    return apiRequest(`/ewaste/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_amount, mark_as_processing }),
    });
  },

  updateStatus: async (id: string, status: string, admin_notes?: string) => {
    return apiRequest(`/ewaste/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes }),
    });
  },

  planCollection: async (id: string, collection_date: string, collection_time?: string, collection_notes?: string, collection_steps?: string[]) => {
    return apiRequest(`/ewaste/${id}/collection-plan`, {
      method: 'PUT',
      body: JSON.stringify({ collection_date, collection_time, collection_notes, collection_steps }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/ewaste/${id}`, {
      method: 'DELETE',
    });
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    return apiRequest('/profile');
  },

  updateUPI: async (upi_id: string) => {
    return apiRequest('/profile/upi', {
      method: 'PUT',
      body: JSON.stringify({ upi_id }),
    });
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    return apiRequest('/payments');
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    return apiRequest('/analytics');
  },
};

// Types
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'captain';
  balance: number;
  locality?: string;
  society?: string;
  upi_id?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EwasteEntry = {
  id: string;
  _id?: string;
  captain_id: string | Profile | { _id?: string; id?: string; email?: string; full_name?: string };
  captain?: Profile | { _id?: string; id?: string; email?: string; full_name?: string };
  description: string;
  quantity: number;
  location_address: string | null;
  google_location_link?: string | null;
  location_lat: number | null;
  location_lng: number | null;
  photos: string[];
  status: 'Pending' | 'Reviewed' | 'Priced' | 'Collection Planned' | 'Pickup Scheduled' | 'Collected' | 'Processed' | 'Payment Initiated' | 'Paid';
  price: number | null;
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
  pickup_date: string | null;
  pickup_notes: string | null;
  payment_amount: number | null;
  payment_status?: 'Pending' | 'Initiated' | 'Completed';
  collection_plan?: {
    collection_date?: string;
    collection_time?: string;
    collection_notes?: string;
    collection_steps?: string[];
  };
  admin_notes?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type Payment = {
  id: string;
  _id?: string;
  captain_id: string | Profile;
  ewaste_id: string | null;
  amount: number;
  description: string | null;
  status?: 'Pending' | 'Processing' | 'Completed';
  created_at?: string;
  createdAt?: string;
};

// Upload API
export const registrationsAPI = {
  submit: async (data: {
    full_name: string;
    email: string;
    phone: string;
    locality: string;
    society?: string;
    address?: string;
    upi_id?: string;
  }) => {
    const response = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },
  getAll: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/registrations${query}`);
  },
  updateStatus: async (id: string, status: string, admin_notes?: string) => {
    return apiRequest(`/registrations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes }),
    });
  },
  delete: async (id: string) => {
    return apiRequest(`/registrations/${id}`, {
      method: 'DELETE',
    });
  },
};

export const uploadAPI = {
  uploadMultipleImages: async (files: File[], folder: string = 'ecocaptian') => {
    const token = getToken();
    const formData = new FormData();
    
    // Append all files
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/upload/multiple?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  uploadSingleImage: async (file: File, folder: string = 'ecocaptian') => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload/single?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};
