import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, senha);
        toast.success("Bem-vindo de volta!");
        navigate('/cliente');
      } else {
        await register(nome, email, senha);
        toast.success("Conta criada! Você já pode fazer login.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.erro || "Falha na requisição.");
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
            <input type="password" placeholder="Sua senha" value={senha} onChange={e => setSenha(e.target.value)} required minLength="8" className="auth-input" />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
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
