import api from './api';

// Gera a cobranca PIX (QR Code) para um pedido pendente.
export const criarPix = (pedidoId) =>
  api.post(`/pagamentos/pix/${pedidoId}`).then(res => res.data);

// Consulta o status do pagamento PIX (usado pelo polling).
export const checkPixStatus = (pedidoId) =>
  api.get(`/pagamentos/pix/${pedidoId}/status`).then(res => res.data);

// Cria um checkout hospedado de cartao (tipo = 'CREDITO' ou 'DEBITO').
// Retorna { checkoutId, checkoutUrl, status } — redirecionar o cliente para checkoutUrl.
export const criarCartao = (pedidoId, tipo) =>
  api.post(`/pagamentos/cartao/${pedidoId}`, null, { params: { tipo } }).then(res => res.data);

// Consulta o status do pagamento com cartao (usado pelo polling da pagina de retorno).
export const checkCartaoStatus = (pedidoId) =>
  api.get(`/pagamentos/cartao/${pedidoId}/status`).then(res => res.data);
