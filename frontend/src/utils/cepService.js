export const buscarCep = async (cep) => {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await res.json();
  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }
  return {
    rua: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
    complemento: data.complemento || '',
  };
};
