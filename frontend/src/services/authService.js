import api from './api';

// Customer Registration
export const registerCustomer = async (userData) => {
  try {
    const response = await api.post('/customer/register', {
      full_name: userData.fullName,
      id_number: userData.idNumber,
      account_number: userData.accountNumber,
      username: userData.username,
      password: userData.password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Customer Login
export const loginCustomer = async (credentials) => {
  try {
    const response = await api.post('/customer/login', {
      username: credentials.username,
      account_number: credentials.accountNumber,
      password: credentials.password,
    });
    
    console.log(' Login response:', response.data); // Debug log
    
    // Save token and user data to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      localStorage.setItem('userType', 'customer');
      
      console.log('Token saved:', response.data.token); // Debug log
    } 
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error); // Debug log
    
    // Extract error message properly
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'Login failed';
    
    throw new Error(errorMessage);
  }
};


// Employee Login
export const loginEmployee = async (credentials) => {
  try {
    const response = await api.post('/employee/login', {
      username: credentials.username,
      password: credentials.password,
    });
    
    // Save token and user data to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      localStorage.setItem('userType', 'employee');
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Get Customer Profile
export const getCustomerProfile = async () => {
  try {
    const response = await api.get('/customer/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

// Get Employee Profile
export const getEmployeeProfile = async () => {
  try {
    const response = await api.get('/employee/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  window.location.href = '/login';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get user type
export const getUserType = () => {
  return localStorage.getItem('userType');
};