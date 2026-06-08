import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileTab = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState(user?.nome || '');
  const [email] = useState(user?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvarDados = async (e) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error('Nome não pode ficar vazio.'); return; }
    setSalvando(true);
    try {
      const payload = { nome: nome.trim() };
      if (senhaAtual && novaSenha) {
        if (novaSenha.length < 8) {
          toast.error('A nova senha deve ter no mínimo 8 caracteres.');
          setSalvando(false);
          return;
        }
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
      }
      await api.put('/autenticacao/atualizar', payload);
      toast.success('Dados atualizados com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'string' ? msg : msg?.erro || 'Erro ao atualizar dados.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <h2 className="client-title">Meus Dados</h2>
      <div className="client-dados-card">
        <form onSubmit={handleSalvarDados} className="client-dados-form">
          <div className="client-dados-field">
            <label>Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="client-dados-input" />
          </div>

          <div className="client-dados-field">
            <label>E-mail</label>
            <input type="email" value={email} disabled className="client-dados-input client-dados-input-disabled" />
            <span className="client-dados-hint">O e-mail não pode ser alterado.</span>
          </div>

          <div className="client-dados-divider">
            <span>Alterar senha (opcional)</span>
          </div>

          <div className="client-dados-field">
            <label>Senha atual</label>
            <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="client-dados-input" placeholder="Digite sua senha atual" />
          </div>

          <div className="client-dados-field">
            <label>Nova senha</label>
            <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} minLength="8" className="client-dados-input" placeholder="Mínimo 8 caracteres" />
          </div>

          <button type="submit" className="btn-primary client-dados-submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <div className="client-dados-card client-danger-zone">
        <h3 className="client-danger-title">Excluir Conta</h3>
        <p className="client-danger-text">
          Ao excluir sua conta, todos os seus dados pessoais serao removidos permanentemente.
          Seus pedidos serao anonimizados conforme a LGPD. Esta acao nao pode ser desfeita.
        </p>
        <button
          className="btn-danger client-danger-btn"
          onClick={async () => {
            if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta acao e irreversivel.')) return;
            const senha = window.prompt('Digite sua senha para confirmar:');
            if (!senha) return;
            try {
              await api.delete('/autenticacao/excluir-conta', { data: { senha } });
              toast.success('Conta excluida com sucesso.');
              logout();
              navigate('/');
            } catch (err) {
              const msg = err.response?.data;
              toast.error(typeof msg === 'string' ? msg : msg?.erro || 'Erro ao excluir conta.');
            }
          }}
        >
          Excluir minha conta
        </button>
      </div>
    </>
  );
};

export default ProfileTab;
