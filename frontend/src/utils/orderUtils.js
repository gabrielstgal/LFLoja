export const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

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
