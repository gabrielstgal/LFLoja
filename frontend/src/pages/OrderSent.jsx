import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderSent.css';

const OrderSent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/cliente'), 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="order-sent-container">
      <div className="order-sent-card">
        <div className="order-sent-icon">&#10003;</div>

        <h1 className="order-sent-title">Pedido Enviado!</h1>

        <p className="order-sent-text">
          Seu pedido foi registrado e enviado via WhatsApp para a loja.
          Aguarde o contato do vendedor para combinar o pagamento.
        </p>

        <div className="order-sent-actions">
          <Link to="/cliente" className="btn-primary order-sent-primary-link">
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
