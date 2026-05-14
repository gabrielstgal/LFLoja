import api from './api';

export const buscarProdutos = (params = {}) => {
  const { pagina = 0, tamanho = 12, ordenar = 'id,desc', categorias, busca, tamanhoFiltro } = params;
  let url = `/produtos/buscar?pagina=${pagina}&tamanho=${tamanho}&ordenar=${ordenar}`;
  if (categorias?.length > 0) url += `&categorias=${categorias.join(',')}`;
  if (busca?.trim()) url += `&busca=${encodeURIComponent(busca.trim())}`;
  if (tamanhoFiltro) {
    const sizeValue = tamanhoFiltro === 'Único' ? 'Unico' : tamanhoFiltro;
    url += `&tamanhoFiltro=${sizeValue}`;
  }
  return api.get(url).then(res => res.data);
};

export const getProduto = (id) =>
  api.get(`/produtos/${id}`).then(res => res.data);

export const criarProduto = (payload) =>
  api.post('/produtos', payload);

export const atualizarProduto = (id, payload) =>
  api.put(`/produtos/${id}`, payload);

export const deletarProduto = (id) =>
  api.delete(`/produtos/${id}`);

export const uploadImagem = async (file) => {
  const formData = new FormData();
  formData.append('arquivo', file);
  const res = await api.post('/produtos/upload-imagem', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.urlImagem;
};
