import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartSubtotal, cartTotal, desconto, cupomAplicado, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [telefoneLoja, setTelefoneLoja] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [parcelas, setParcelas] = useState(1);

  useEffect(() => {
    api.get('/loja/config')
      .then(res => setTelefoneLoja(res.data.whatsapp))
      .catch(() => toast.error('Erro ao carregar dados da loja.'));
  }, []);

  const [address, setAddress] = useState({
    rua: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '', cep: ''
  });

  const [buscandoCep, setBuscandoCep] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));

    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo);
      }
    }
  };

  const buscarCep = async (cep) => {
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
          complemento: data.complemento || prev.complemento,
        }));
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setBuscandoCep(false);
    }
  };

  const buildWhatsAppMessage = (protocolo) => {
    let msg = `Olá! Fiz o pedido *${protocolo}* na LF Clothing.\n\n`;

    cartItems.forEach(item => {
      msg += `- ${item.nome}`;
      if (item.selectedSize) msg += ` (${item.selectedSize})`;
      msg += ` x${item.quantity}\n`;
    });

    if (cupomAplicado && desconto > 0) {
      msg += `\nCupom: *${cupomAplicado}* (-R$ ${desconto.toFixed(2)})`;
    }
    msg += `\n*Total: R$ ${cartTotal.toFixed(2)}*`;
    msg += `\n*Pagamento:* ${paymentMethod === 'PIX' ? 'Pix' : 'Cartão de Crédito'}`;
    if (paymentMethod === 'CREDITO' && parcelas > 1) {
      msg += ` (${parcelas}x de R$ ${(cartTotal / parcelas).toFixed(2)})`;
    }
    msg += `\n*Frete:* A definir com vendedor`;
    msg += `\n\nAguardo a confirmação!`;

    return encodeURIComponent(msg);
  };

  const handleFinalize = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { toast.error('Carrinho vazio!'); return; }

    setLoading(true);
    try {
      const payload = {
        itens: cartItems.map(item => ({
          produtoId: item.id,
          quantidade: item.quantity,
          tamanho: item.selectedSize || null,
        })),
        ...address,
      };

      const response = await api.post('/pedidos/checkout', payload);
      const protocolo = response.data.protocolo;

      const mensagem = buildWhatsAppMessage(protocolo);
      const whatsappUrl = `https://wa.me/${telefoneLoja}?text=${mensagem}`;

      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate('/pedido/enviado');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.erro || 'Erro ao registrar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) { navigate('/auth'); return null; }

  const parcelasOptions = [];
  for (let i = 1; i <= 12; i++) {
    const valor = (cartTotal / i).toFixed(2);
    parcelasOptions.push({ value: i, label: i === 1 ? `1x de R$ ${valor} (à vista)` : `${i}x de R$ ${valor}` });
  }

  return (
    <div className="checkout-container">
      <div className="checkout-summary">
        <div className="checkout-card">
          <h3 className="checkout-card-title">Resumo da Compra</h3>

          <div className="checkout-items">
            {cartItems.map(item => (
              <div key={item.cartId} className="checkout-item">
                <div className="checkout-item-left">
                  <img src={item.urlImagem || item.image} alt={item.nome} className="checkout-item-img" loading="lazy" />
                  <div>
                    <h5 className="checkout-item-name">{item.nome}</h5>
                    <span className="checkout-item-detail">
                      Qtd: {item.quantity}{item.selectedSize ? ` | Tam: ${item.selectedSize}` : ''}
                    </span>
                  </div>
                </div>
                <div className="checkout-item-price">R$ {(item.preco * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {desconto > 0 && (
            <>
              <div className="checkout-summary-line">
                <span>Subtotal:</span>
                <span>R$ {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-line checkout-discount-line">
                <span>Cupom ({cupomAplicado}):</span>
                <span>-R$ {desconto.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="checkout-total">
            <span>Total:</span>
            <span className="checkout-total-value">R$ {cartTotal.toFixed(2)}</span>
          </div>

          <div className="checkout-frete-info">
            <span>Frete:</span>
            <span>A definir com vendedor</span>
          </div>
        </div>
      </div>

      <div className="checkout-form-section">
        <h2 className="checkout-form-title">Finalizar Pedido</h2>
        <p className="checkout-form-subtitle">Preencha os dados e escolha a forma de pagamento.</p>

        <form onSubmit={handleFinalize}>
          <span className="checkout-section-label">Endereço de entrega</span>
          <div className="checkout-address-grid">
            <div className="checkout-cep-wrapper checkout-input-full">
              <input required name="cep" placeholder="CEP" maxLength="9" value={address.cep} onChange={handleAddressChange} className="checkout-input" />
              {buscandoCep && <span className="checkout-cep-loading">Buscando...</span>}
            </div>
            <input required name="rua" placeholder="Rua / Avenida" maxLength="200" value={address.rua} onChange={handleAddressChange} className="checkout-input checkout-input-full" />
            <input required name="numero" placeholder="Número" maxLength="20" value={address.numero} onChange={handleAddressChange} className="checkout-input" />
            <input name="complemento" placeholder="Complemento" maxLength="100" value={address.complemento} onChange={handleAddressChange} className="checkout-input" />
            <input required name="bairro" placeholder="Bairro" maxLength="100" value={address.bairro} onChange={handleAddressChange} className="checkout-input checkout-input-full" />
            <input required name="cidade" placeholder="Cidade" maxLength="100" value={address.cidade} onChange={handleAddressChange} className="checkout-input" />
            <input required name="estado" placeholder="Estado (UF)" maxLength="2" value={address.estado} onChange={handleAddressChange} className="checkout-input" />
          </div>

          <span className="checkout-section-label">Forma de pagamento</span>
          <div className="checkout-payment-methods">
            <button
              type="button"
              onClick={() => { setPaymentMethod('PIX'); setParcelas(1); }}
              className={`checkout-payment-btn ${paymentMethod === 'PIX' ? 'selected pix' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M11.354 2.646a.9.9 0 0 1 1.274 0l2.196 2.196a.9.9 0 0 0 .638.264h2.788a.9.9 0 0 1 .9.9v2.788a.9.9 0 0 0 .264.638l2.196 2.196a.9.9 0 0 1 0 1.274l-2.196 2.196a.9.9 0 0 0-.264.638v2.788a.9.9 0 0 1-.9.9h-2.788a.9.9 0 0 0-.638.264l-2.196 2.196a.9.9 0 0 1-1.274 0l-2.196-2.196a.9.9 0 0 0-.638-.264H5.732a.9.9 0 0 1-.9-.9v-2.788a.9.9 0 0 0-.264-.638L2.372 12.9a.9.9 0 0 1 0-1.274l2.196-2.196a.9.9 0 0 0 .264-.638V5.006a.9.9 0 0 1 .9-.9h2.788a.9.9 0 0 0 .638-.264z"/>
              </svg>
              Pix
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CREDITO')}
              className={`checkout-payment-btn ${paymentMethod === 'CREDITO' ? 'selected credito' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Crédito
            </button>
          </div>

          {paymentMethod === 'CREDITO' && (
            <div className="checkout-parcelas">
              <label className="checkout-parcelas-label">Parcelas desejadas</label>
              <select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="checkout-input"
              >
                {parcelasOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading || !telefoneLoja} className="btn-primary checkout-submit">
            {loading ? (<><span className="checkout-spinner" /> Registrando pedido...</>) : 'Enviar Pedido via WhatsApp'}
          </button>

          <p className="checkout-submit-hint">Você será redirecionado para o WhatsApp com os detalhes do pedido.</p>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
