import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function with error handling
export const login = async (username, password) => {
  try {
    console.log('Login API called for:', username);
    const response = await axios.post('http://127.0.0.1:8000/api/login/', {
      username,
      password
    });
    console.log('Login API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

// Register function with error handling
export const register = async (userData) => {
  try {
    console.log('Register API called for:', userData.username);
    const response = await axios.post('http://127.0.0.1:8000/api/register/', userData);
    console.log('Register API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Registration failed' 
    };
  }
};

export const getProjects = async () => {
  const response = await api.get('projects/');
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get('incidents/');
  return response.data;
};

export const getMaterials = async () => {
  const response = await api.get('materials/');
  return response.data;
};

export default api;