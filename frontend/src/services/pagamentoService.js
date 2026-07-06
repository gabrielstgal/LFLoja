import api from './api';

// Gera a cobranca PIX (QR Code) para um pedido pendente.
export const criarPix = (pedidoId) =>
  api.post(`/pagamentos/pix/${pedidoId}`).then(res => res.data);

// Consulta o status do pagamento PIX (usado pelo polling).
export const checkPixStatus = (pedidoId) =>
  api.get(`/pagamentos/pix/${pedidoId}/status`).then(res => res.data);
