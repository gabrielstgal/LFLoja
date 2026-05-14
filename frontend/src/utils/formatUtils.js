export const formatCurrency = (value) =>
  `R$ ${Number(value).toFixed(2)}`;

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('pt-BR');

export const formatCompactCurrency = (value) =>
  value >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : `R$ ${value.toFixed(0)}`;
