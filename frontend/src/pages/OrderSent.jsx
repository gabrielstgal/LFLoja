import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderSent.css';

const OrderSent = () => {
  const navigate = useNavigate();
  const [whatsappUrl] = useState(() => {
    const url = sessionStorage.getItem('lf-whatsapp-url');
    sessionStorage.removeItem('lf-whatsapp-url');
    return url;
  });

  useEffect(() => {
    // Redirecionar ao WhatsApp automaticamente após breve delay
    if (whatsappUrl) {
      const wpTimer = setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1500);
      return () => clearTimeout(wpTimer);
    }
  }, [whatsappUrl]);

  useEffect(() => {
    const timer = setTimeout(() => navigate('/cliente'), 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="order-sent-container">
      <div className="order-sent-card">
        <div className="order-sent-icon">&#10003;</div>

        <h1 className="order-sent-title">Pedido Enviado!</h1>

        <p className="order-sent-text">
          Seu pedido foi registrado com sucesso!
          {whatsappUrl
            ? ' Você será redirecionado para o WhatsApp em instantes...'
            : ' Enviado via WhatsApp para a loja. Aguarde o contato do vendedor.'}
        </p>

        <div className="order-sent-actions">
          {whatsappUrl && (
            <a href={whatsappUrl} className="btn-primary order-sent-primary-link" rel="noopener noreferrer">
              Abrir WhatsApp Agora
            </a>
          )}
          <Link to="/cliente" className="order-sent-secondary-link">
            Ver Meus Pedidos
          </Link>
          <Link to="/" className="order-sent-secondary-link">
            Continuar Comprando
          </Link>
        </div>

        <p className="order-sent-redirect">
          Você será redirecionado para seus pedidos em instantes...
        </p>
      </div>
    </div>
  );
};

export default OrderSent;
