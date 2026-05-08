import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const GUEST_CART_KEY = 'lf-clothing-cart-guest';
const getCartKey = (userId) => `lf-clothing-cart-${userId}`;

const loadCart = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (parsed.length > 0 && parsed[0].price !== undefined) {
      localStorage.removeItem(key);
      return [];
    }
    return parsed;
  } catch (e) {
    localStorage.removeItem(key);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [cupomDados, setCupomDados] = useState(null);
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    if (user) {
      const userCart = loadCart(getCartKey(user.id));
      const guestCart = loadCart(GUEST_CART_KEY);

      if (guestCart.length > 0) {
        const merged = [...userCart];
        guestCart.forEach(guestItem => {
          const existing = merged.find(item => item.cartId === guestItem.cartId);
          if (existing) {
            existing.quantity += guestItem.quantity;
          } else {
            merged.push(guestItem);
          }
        });
        setCartItems(merged);
        localStorage.removeItem(GUEST_CART_KEY);
      } else {
        setCartItems(userCart);
      }
    } else {
      setCartItems(loadCart(GUEST_CART_KEY));
    }
  }, [user]);

  useEffect(() => {
    const key = user ? getCartKey(user.id) : GUEST_CART_KEY;
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  const getPrecoEfetivo = (item) => {
    return (item.precoPromocional && item.precoPromocional < item.preco) ? item.precoPromocional : item.preco;
  };

  const cartSubtotal = cartItems.reduce((total, item) => total + getPrecoEfetivo(item) * item.quantity, 0);

  useEffect(() => {
    if (!cupomDados) {
      setDesconto(0);
      return;
    }
    if (cupomDados.tipo === 'PERCENTUAL') {
      setDesconto(cartSubtotal * (cupomDados.valor / 100));
    } else {
      setDesconto(Math.min(cupomDados.valor, cartSubtotal));
    }
  }, [cupomDados, cartSubtotal]);

  const cartTotal = Math.max(cartSubtotal - desconto, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const aplicarCupom = useCallback(async (codigo) => {
    const codigoTrimmed = codigo.trim();
    if (!codigoTrimmed) return { ok: false, msg: 'Digite um código de cupom.' };
    if (cupomAplicado === codigoTrimmed.toUpperCase()) return { ok: false, msg: 'Este cupom já está aplicado.' };

    try {
      const res = await api.post('/cupons/validar', { codigo: codigoTrimmed });
      const { codigo: cod, tipo, valor } = res.data;
      setCupomAplicado(cod);
      setCupomDados({ tipo, valor: Number(valor) });
      const desc = tipo === 'PERCENTUAL' ? `${valor}%` : `R$ ${Number(valor).toFixed(2)}`;
      return { ok: true, msg: `Cupom ${cod} aplicado! Desconto de ${desc}.` };
    } catch (err) {
      const msg = err.response?.data?.erro || 'Cupom inválido.';
      return { ok: false, msg };
    }
  }, [cupomAplicado]);

  const removerCupom = useCallback(() => {
    setCupomAplicado(null);
    setCupomDados(null);
    setDesconto(0);
  }, []);

  const addToCart = (product) => {
    const cartId = `${product.id}-${product.selectedSize || 'default'}`;
    setCartItems(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) { removeFromCart(cartId); return; }
    setCartItems(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQuantity } : item));
  };

  const updateSize = (cartId, newSize) => {
    setCartItems(prev => {
      const item = prev.find(i => i.cartId === cartId);
      if (!item) return prev;
      const newCartId = `${item.id}-${newSize || 'default'}`;
      const existing = prev.find(i => i.cartId === newCartId && i.cartId !== cartId);
      if (existing) {
        return prev
          .map(i => i.cartId === newCartId ? { ...i, quantity: i.quantity + item.quantity } : i)
          .filter(i => i.cartId !== cartId);
      }
      return prev.map(i => i.cartId === cartId ? { ...i, selectedSize: newSize, cartId: newCartId } : i);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCupomAplicado(null);
    setCupomDados(null);
    setDesconto(0);
  };

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, updateSize, clearCart,
      cartSubtotal, cartTotal, cartCount, getPrecoEfetivo,
      isCartOpen, setIsCartOpen,
      cupomAplicado, cupomDados, desconto, aplicarCupom, removerCupom
    }}>
      {children}
    </CartContext.Provider>
  );
};
