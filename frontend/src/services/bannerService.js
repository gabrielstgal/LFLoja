import api from './api';

export const listarBanners = () =>
  api.get('/banners').then(res => res.data || []);

export const listarTodosBanners = () =>
  api.get('/banners/todos').then(res =>
    Array.isArray(res.data) ? res.data : []
  );

export const criarBanner = (payload) =>
  api.post('/banners', payload);

export const atualizarBanner = (id, payload) =>
  api.put(`/banners/${id}`, payload);

export const deletarBanner = (id) =>
  api.delete(`/banners/${id}`);
