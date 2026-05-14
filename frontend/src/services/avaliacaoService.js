import api from './api';

export const listarAvaliacoes = (produtoId) =>
  api.get(`/avaliacoes/produto/${produtoId}`).then(res => res.data);

export const enviarAvaliacao = (produtoId, payload) =>
  api.post(`/avaliacoes/produto/${produtoId}`, payload);
