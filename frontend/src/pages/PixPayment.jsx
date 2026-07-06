import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { criarPix, checkPixStatus } from '../services/pagamentoService';
import './PixPayment.css';

const POLL_INTERVAL_MS = 4000;

const PixPayment = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [pix, setPix] = useState(null); // { brCode, brCodeBase64, expiresAt, valorTotal }
  const [estado, setEstado] = useState('PENDENTE'); // PENDENTE | PAGO | EXPIRADO | ERRO
  const [copiado, setCopiado] = useState(false);
  const [restante, setRestante] = useState(null); // segundos ate expirar

  const pollRef = useRef(null);

  const gerarCobranca = useCallback(async () => {
    setLoading(true);
    setEstado('PENDENTE');
    try {
      const data = await criarPix(pedidoId);
      setPix(data);
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao gerar cobrança PIX.');
      setEstado('ERRO');
    } finally {
      setLoading(false);
    }
  }, [pedidoId]);

  // Cria a cobranca ao montar.
  useEffect(() => {
    gerarCobranca();
  }, [gerarCobranca]);

  // Polling do status enquanto pendente.
  useEffect(() => {
    if (estado !== 'PENDENTE' || !pix) return undefined;

    const checar = async () => {
      try {
        const res = await checkPixStatus(pedidoId);
        if (res.status === 'PAID' || res.pedidoStatus === 'PAGO') {
          clearInterval(pollRef.current);
          clearCart();
          setEstado('PAGO');
        } else if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(res.status)) {
          clearInterval(pollRef.current);
          setEstado('EXPIRADO');
        }
      } catch {
        // Erro transitorio de rede — mantem o polling.
      }
    };

    pollRef.current = setInterval(checar, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [estado, pix, pedidoId, clearCart]);

  // Contagem regressiva ate a expiracao.
  useEffect(() => {
    if (!pix?.expiresAt || estado !== 'PENDENTE') return undefined;

    const tick = () => {
      const diff = Math.floor((new Date(pix.expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setRestante(0);
        setEstado((e) => (e === 'PENDENTE' ? 'EXPIRADO' : e));
      } else {
        setRestante(diff);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [pix, estado]);

  const copiar = async () => {
    if (!pix?.brCode) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Copie manualmente.');
    }
  };

  const formatarTempo = (s) => {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${m}:${seg.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="pix-container">
        <div className="pix-card">
          <span className="pix-spinner" />
          <p>Gerando cobrança PIX...</p>
        </div>
      </div>
    );
  }

  if (estado === 'PAGO') {
    return (
      <div className="pix-container">
        <div className="pix-card pix-success">
          <div className="pix-success-icon">&#10003;</div>
          <h1 className="pix-title">Pagamento aprovado!</h1>
          <p className="pix-text">Recebemos seu pagamento via PIX. Seu pedido está confirmado.</p>
          <div className="pix-actions">
            <Link to="/cliente" className="btn-primary">Ver Meus Pedidos</Link>
            <Link to="/" className="pix-secondary-link">Continuar Comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  if (estado === 'EXPIRADO' || estado === 'ERRO') {
    return (
      <div className="pix-container">
        <div className="pix-card">
          <h1 className="pix-title">{estado === 'EXPIRADO' ? 'PIX expirado' : 'Erro na cobrança'}</h1>
          <p className="pix-text">
            {estado === 'EXPIRADO'
              ? 'O tempo para pagamento deste PIX terminou. Gere um novo código para continuar.'
              : 'Não foi possível gerar a cobrança. Tente novamente.'}
          </p>
          <div className="pix-actions">
            <button onClick={gerarCobranca} className="btn-primary">Gerar novo PIX</button>
            <button onClick={() => navigate('/checkout')} className="pix-secondary-link">Voltar ao checkout</button>
          </div>
        </div>
      </div>
    );
  }

  // Estado PENDENTE
  return (
    <div className="pix-container">
      <div className="pix-card">
        <h1 className="pix-title">Pague com PIX</h1>
        {pix?.valorTotal != null && (
          <p className="pix-valor">R$ {Number(pix.valorTotal).toFixed(2)}</p>
        )}

        {pix?.brCodeBase64 && (
          <img src={pix.brCodeBase64} alt="QR Code PIX" className="pix-qr" />
        )}

        <p className="pix-text">Escaneie o QR Code no app do seu banco ou copie o código abaixo.</p>

        <div className="pix-copia-cola">
          <input type="text" readOnly value={pix?.brCode || ''} className="pix-code-input" />
          <button onClick={copiar} className="pix-copy-btn">
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        {restante != null && (
          <p className="pix-timer">Expira em {formatarTempo(restante)}</p>
        )}

        <p className="pix-aguardando">
          <span className="pix-spinner pix-spinner-sm" /> Aguardando confirmação do pagamento...
        </p>
      </div>
    </div>
  );
};

export default PixPayment;
