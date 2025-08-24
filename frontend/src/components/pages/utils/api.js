import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = Bearer ${token};
  }
  return config;
});

export const connectWalletAPI = async (walletData) => {
  const response = await api.post('/auth/connect', walletData);
  return response.data;
};

export const loginWallet = async (walletData) => {
  const response = await api.post('/auth/login', walletData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/profiles/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/profiles', profileData);
  return response.data;
};

export const getMatchSuggestions = async () => {
  const response = await api.get('/matches/suggestions');
  return response.data;
};

export const likeProfile = async (userId) => {
  const response = await api.post(/matches/like/${userId});
  return response.data;
};

export const triggerSOS = async (location, message) => {
  const response = await api.post('/sos/trigger', { location, message });
  return response.data;
};

export const addEmergencyContact = async (contactData) => {
  const response = await api.post('/sos/contacts', contactData);
  return response.data;
};

export default api;