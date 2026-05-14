import { useState } from 'react';
import { buscarCep } from '../utils/cepService';

const useCepLookup = (setAddress) => {
  const [buscandoCep, setBuscandoCep] = useState(false);

  const lookup = async (cep) => {
    setBuscandoCep(true);
    try {
      const dados = await buscarCep(cep);
      setAddress(prev => ({
        ...prev,
        rua: dados.rua || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.cidade || prev.cidade,
        estado: dados.estado || prev.estado,
        complemento: dados.complemento || prev.complemento,
      }));
      return { ok: true };
    } catch {
      return { ok: false, msg: 'CEP não encontrado.' };
    } finally {
      setBuscandoCep(false);
    }
  };

  return { buscandoCep, lookup };
};

export default useCepLookup;
