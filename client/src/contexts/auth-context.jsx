import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import LoginModal from '../components/auth/login-modal';
import RegisterModal from '../components/auth/register-modal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [initialRegisterRole, setInitialRegisterRole] = useState('student');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    onSuccess: (userData) => {
      if (userData) {
        setUser(userData);
      }
    },
    onError: () => {
      setUser(null);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const login = async (credentials) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      return data.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      queryClient.invalidateQueries();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to register');
    }
  };

  const showLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };

  const showRegisterModal = (role = 'student') => {
    setInitialRegisterRole(role);
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    showLoginModal,
    showRegisterModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={setUser}
        onShowRegister={showRegisterModal}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={setUser}
        onShowLogin={showLoginModal}
        initialRole={initialRegisterRole}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
