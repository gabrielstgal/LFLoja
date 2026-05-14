import api from './api';

export const meusPedidos = () =>
  api.get('/pedidos/meus').then(res => {
    const data = Array.isArray(res.data) ? res.data : [];
    data.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    return data;
  });

export const todosPedidos = () =>
  api.get('/pedidos/todos').then(res =>
    Array.isArray(res.data) ? res.data : []
  );

export const checkout = (payload) =>
  api.post('/pedidos/checkout', payload).then(res => res.data);

export const atualizarStatus = (pedidoId, novoStatus) =>
  api.put(`/pedidos/${pedidoId}/status`, { status: novoStatus });
