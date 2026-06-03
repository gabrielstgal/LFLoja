import api from './api';

export const meusPedidos = () =>
  api.get('/pedidos/meus').then(res => {
    const data = Array.isArray(res.data) ? res.data : [];
    data.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    return data;
  });

export const todosPedidos = async () => {
  const allOrders = [];
  let pagina = 0;
  let totalPages = 1;
  while (pagina < totalPages) {
    const res = await api.get(`/pedidos/todos?pagina=${pagina}&tamanho=200`);
    const data = res.data;
    if (data.content) {
      allOrders.push(...data.content);
      totalPages = data.totalPages;
    } else if (Array.isArray(data)) {
      return data;
    }
    pagina++;
  }
  return allOrders;
};

export const checkout = (payload) =>
  api.post('/pedidos/checkout', payload).then(res => res.data);

export const atualizarStatus = (pedidoId, novoStatus) =>
  api.put(`/pedidos/${pedidoId}/status`, { status: novoStatus });
