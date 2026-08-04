import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuslink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuslink_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { access_token, user_id, full_name, role } = res.data;
      
      const userData = { id: user_id, username, full_name, role };
      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('campuslink_token', access_token);
      localStorage.setItem('campuslink_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.detail || 'Invalid credentials or server unreachable' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuslink_token');
    localStorage.removeItem('campuslink_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
