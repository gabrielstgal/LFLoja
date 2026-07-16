export const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ENVIADO: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const METODO_PAGAMENTO_LABELS = {
  PIX: 'PIX',
  DEBITO: 'Cartão (débito)',
  CREDITO: 'Cartão (crédito)',
};

export const getMetodoPagamentoLabel = (metodo) => METODO_PAGAMENTO_LABELS[metodo] || '—';

export const STATUS_STEPS = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE'];

export const getStatusClass = (status) => {
  const map = {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    ENVIADO: 'enviado',
    ENTREGUE: 'entregue',
    CANCELADO: 'cancelado',
  };
  return map[status] || 'default';
};

export const getClientStatusClass = (status) => {
  if (status === 'PAGO' || status === 'ENVIADO' || status === 'ENTREGUE') return 'client-status-ok';
  if (status === 'CANCELADO') return 'client-status-canceled';
  return 'client-status-pending';
};
