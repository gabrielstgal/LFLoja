import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

const getFavKey = (userId) => `lf-clothing-favs-${userId || 'guest'}`;

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getFavKey(user?.id));
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(getFavKey(user?.id), JSON.stringify(favorites));
  }, [favorites, user]);

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, {
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        precoPromocional: product.precoPromocional,
        urlImagem: product.urlImagem || product.image,
        categoria: product.categoria,
      }];
    });
  };

  const isFavorite = (productId) => favorites.some(p => p.id === productId);

  const favCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, favCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};
