import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './SideCart.css';

const SideCart = () => {
  const {
    cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart,
    cartSubtotal, cartTotal, desconto, cupomAplicado, aplicarCupom, removerCupom
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cupomInput, setCupomInput] = useState('');

  if (!isCartOpen) return null;

  const hasItemWithoutSize = cartItems.some(item =>
    item.tamanhos && item.tamanhos.length > 0 && !item.selectedSize
  );

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Você precisa estar logado para finalizar a compra!");
      setIsCartOpen(false);
      navigate('/auth');
      return;
    }
    if (hasItemWithoutSize) {
      toast.error("Selecione o tamanho de todos os itens antes de continuar.");
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleAplicarCupom = async () => {
    const result = await aplicarCupom(cupomInput);
    if (result.ok) {
      toast.success(result.msg);
      setCupomInput('');
    } else {
      toast.error(result.msg);
    }
  };

  const handleCupomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAplicarCupom();
    }
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
      <div className={`side-cart glass ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>x</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Seu carrinho está vazio.</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsCartOpen(false)}>Continuar Comprando</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.cartId} className="cart-item">
                <img src={item.image || item.urlImagem} alt={item.nome} className="item-image" loading="lazy" />
                <div className="item-details">
                  <h4 className="item-name">{item.nome}</h4>
                  {item.selectedSize ? (
                    <span className="item-size">Tam: {item.selectedSize}</span>
                  ) : item.tamanhos && item.tamanhos.length > 0 ? (
                    <span className="item-size-missing">Tamanho não selecionado</span>
                  ) : null}
                  <p className="item-price">R$ {item.preco.toFixed(2)}</p>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.cartId)}>Remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-coupon">
              {cupomAplicado ? (
                <div className="cart-coupon-applied">
                  <div className="cart-coupon-tag">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <span>{cupomAplicado}</span>
                    <span className="cart-coupon-desc">-R$ {desconto.toFixed(2)}</span>
                  </div>
                  <button className="cart-coupon-remove" onClick={removerCupom}>Remover</button>
                </div>
              ) : (
                <div className="cart-coupon-form">
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    value={cupomInput}
                    onChange={(e) => setCupomInput(e.target.value)}
                    onKeyDown={handleCupomKeyDown}
                    maxLength={20}
                    className="cart-coupon-input"
                  />
                  <button className="cart-coupon-btn" onClick={handleAplicarCupom}>Aplicar</button>
                </div>
              )}
            </div>

            {desconto > 0 && (
              <div className="cart-summary-line">
                <span>Subtotal:</span>
                <span>R$ {cartSubtotal.toFixed(2)}</span>
              </div>
            )}
            {desconto > 0 && (
              <div className="cart-summary-line cart-discount-line">
                <span>Desconto:</span>
                <span>-R$ {desconto.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-total">
              <span>Total:</span>
              <span style={{ color: 'var(--color-primary)' }}>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleProceedToCheckout}>
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SideCart;
