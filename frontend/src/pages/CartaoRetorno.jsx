import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkCartaoStatus } from '../services/pagamentoService';
import './PixPayment.css';

const POLL_INTERVAL_MS = 4000;

/**
 * Página para onde a AbacatePay redireciona o cliente após o pagamento com cartão
 * (completionUrl). O pagamento é confirmado de forma assíncrona pelo webhook; aqui
 * fazemos polling do status até o pedido ficar PAGO (ou falhar).
 */
const CartaoRetorno = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [estado, setEstado] = useState('PENDENTE'); // PENDENTE | PAGO | FALHOU
  const pollRef = useRef(null);

  const checar = useCallback(async () => {
    try {
      const res = await checkCartaoStatus(pedidoId);
      if (res.status === 'PAID' || res.pedidoStatus === 'PAGO') {
        clearInterval(pollRef.current);
        clearCart();
        setEstado('PAGO');
      } else if (['EXPIRED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(res.status)) {
        clearInterval(pollRef.current);
        setEstado('FALHOU');
      }
    } catch {
      // Erro transitório de rede — mantém o polling.
    }
  }, [pedidoId, clearCart]);

  useEffect(() => {
    checar();
    pollRef.current = setInterval(checar, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [checar]);

  if (estado === 'PAGO') {
    return (
      <div className="pix-container">
        <div className="pix-card pix-success">
          <div className="pix-success-icon">&#10003;</div>
          <h1 className="pix-title">Pagamento aprovado!</h1>
          <p className="pix-text">Recebemos seu pagamento com cartão. Seu pedido está confirmado.</p>
          <div className="pix-actions">
            <Link to="/cliente" className="btn-primary">Ver Meus Pedidos</Link>
            <Link to="/" className="pix-secondary-link">Continuar Comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  if (estado === 'FALHOU') {
    return (
      <div className="pix-container">
        <div className="pix-card">
          <h1 className="pix-title">Pagamento não concluído</h1>
          <p className="pix-text">
            O pagamento com cartão não foi concluído ou foi cancelado. Você pode tentar novamente.
          </p>
          <div className="pix-actions">
            <button onClick={() => navigate('/checkout')} className="btn-primary">Voltar ao checkout</button>
            <Link to="/cliente" className="pix-secondary-link">Ver Meus Pedidos</Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado PENDENTE — confirmando pagamento
  return (
    <div className="pix-container">
      <div className="pix-card">
        <span className="pix-spinner" />
        <h1 className="pix-title">Confirmando seu pagamento...</h1>
        <p className="pix-text">
          Estamos confirmando o pagamento com a operadora do cartão. Isso pode levar alguns instantes.
          Você pode acompanhar em "Meus Pedidos".
        </p>
        <p className="pix-aguardando">
          <span className="pix-spinner pix-spinner-sm" /> Aguardando confirmação...
        </p>
        <div className="pix-actions">
          <Link to="/cliente" className="pix-secondary-link">Ver Meus Pedidos</Link>
        </div>
      </div>
    </div>
  );
};

export default CartaoRetorno;
