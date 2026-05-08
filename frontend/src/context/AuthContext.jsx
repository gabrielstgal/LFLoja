import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/autenticacao/logout');
    } catch (_) {
      // ignora erro no logout
    }
    localStorage.removeItem('lf-clothing-cart');
    setUser(null);
  }, []);

  // Recupera sessao ao carregar a pagina
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/autenticacao/me');
        setUser(response.data);
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Escuta evento de logout forçado (token expirado sem refresh)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      if (window.location.pathname !== '/auth') {
        localStorage.setItem('lf-session-expired', '1');
        window.location.href = '/auth';
      }
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/autenticacao/login', { email, senha });
      setUser(response.data);
      return true;
    } catch (error) {
      const msg = error.response?.data;
      throw (typeof msg === 'string' ? msg : msg?.erro) || "Ocorreu um erro no login.";
    }
  };

  const register = async (nome, email, senha) => {
    try {
      await api.post('/autenticacao/registrar', { nome, email, senha });
      return true;
    } catch (error) {
      const msg = error.response?.data;
      throw (typeof msg === 'string' ? msg : msg?.erro) || "Ocorreu um erro no registro.";
    }
  };

  const isAdmin = Array.isArray(user?.papeis) && user.papeis.includes('ROLE_ADMIN');

  if (loading) {
    return <Loading texto="" />;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
