import api from './api';

export const getLojaConfig = () =>
  api.get('/loja/config').then(res => res.data);
