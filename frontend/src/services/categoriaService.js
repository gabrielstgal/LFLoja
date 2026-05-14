import api from './api';

export const listarCategorias = () =>
  api.get('/categorias').then(res => res.data || []);

export const criarCategoria = (payload) =>
  api.post('/categorias', payload);

export const atualizarCategoria = (id, payload) =>
  api.put(`/categorias/${id}`, payload);

export const deletarCategoria = (id) =>
  api.delete(`/categorias/${id}`);
