import api from './api';

export const listarCupons = () =>
  api.get('/cupons').then(res =>
    Array.isArray(res.data) ? res.data : []
  );

export const criarCupom = (payload) =>
  api.post('/cupons', payload);

export const validarCupom = (codigo) =>
  api.post('/cupons/validar', { codigo }).then(res => res.data);

export const toggleCupom = (id) =>
  api.put(`/cupons/${id}/toggle`);

export const deletarCupom = (id) =>
  api.delete(`/cupons/${id}`);
