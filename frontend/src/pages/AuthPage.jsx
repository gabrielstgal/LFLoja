import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AuthPage.css';

const UserIcon = () => (
  <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('lf-session-expired')) {
      localStorage.removeItem('lf-session-expired');
      toast.info('Sua sessão expirou. Faça login novamente.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (!isLogin && !nome.trim()) {
      toast.error('Digite seu nome.');
      return;
    }
    if (!isLogin && !aceitouTermos) {
      toast.error('Voce precisa aceitar os Termos de Uso e a Politica de Privacidade.');
      return;
    }
    if (senha.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, senha);
        toast.success("Bem-vindo de volta!");
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/cliente');
      } else {
        await register(nome, email, senha);
        toast.success("Cadastro processado! Tente fazer login.");
        setIsLogin(true);
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.erro;
      if (msg?.includes('Bad credentials') || msg?.includes('401')) {
        toast.error('E-mail ou senha incorretos.');
      } else {
        toast.error(msg || 'Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/img/logo/LfLogo.png" alt="LF Clothing" className="auth-logo" />
        <h2 className="auth-title">{isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}</h2>
        <p className="auth-subtitle">{isLogin ? 'Entre para acessar sua conta' : 'Cadastre-se para começar a comprar'}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <UserIcon />
              <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} required className="auth-input" />
            </div>
          )}

          <div className="auth-field">
            <MailIcon />
            <input type="email" placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" />
          </div>

          <div className="auth-field">
            <LockIcon />
            <input type={showSenha ? 'text' : 'password'} placeholder="Sua senha" value={senha} onChange={e => setSenha(e.target.value)} required minLength="8" className="auth-input auth-input-password" />
            <button type="button" className="auth-eye-btn" onClick={() => setShowSenha(s => !s)} title={showSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {showSenha ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {!isLogin && (
            <label className="auth-terms-label">
              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} className="auth-terms-checkbox" />
              <span>Li e aceito os <Link to="/termos-de-uso" target="_blank" className="auth-terms-link">Termos de Uso</Link> e a <Link to="/politica-de-privacidade" target="_blank" className="auth-terms-link">Politica de Privacidade</Link></span>
            </label>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading || (!isLogin && !aceitouTermos)}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <p className="auth-toggle">
          {isLogin ? "Ainda não tem conta? " : "Já possui conta? "}
          <span onClick={() => setIsLogin(!isLogin)} className="auth-toggle-link">
            {isLogin ? "Cadastre-se" : "Faça login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
