import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { listarCategorias } from '../services/categoriaService';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const perfilRef = useRef(null);
  const { cartCount, setIsCartOpen } = useCart();
  const { favCount } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    listarCategorias()
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCategoriasOpen(false);
    setPerfilOpen(false);
  }, [location]);

  useEffect(() => {
    if (!perfilOpen) return;
    const handleClickOutside = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [perfilOpen]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?busca=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  const handleCategoriaClick = (catNome) => {
    navigate(`/catalogo?categoria=${catNome}`);
    setCategoriasOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled glass' : ''}`}>
      <button className="header-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <div className="header-brand">
        <Link to="/">
          <img src="/img/logo/LogoLf.png" alt="LF Clothing" className="logo-img" />
        </Link>
      </div>

      <nav className={`header-nav ${menuOpen ? 'header-nav-open' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/')}`}>Início</Link>

        <div
          className="nav-dropdown"
          onMouseEnter={() => setCategoriasOpen(true)}
          onMouseLeave={() => setCategoriasOpen(false)}
        >
          <Link to="/catalogo" className={`nav-link ${isActive('/catalogo')}`}>
            Categorias
            <svg className="nav-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </Link>
          {categoriasOpen && (
            <div className="nav-dropdown-menu">
              <button onClick={() => { navigate('/catalogo'); setCategoriasOpen(false); }} className="nav-dropdown-item">Ver Tudo</button>
              {categorias.map(cat => (
                <button key={cat.id} onClick={() => handleCategoriaClick(cat.nome)} className="nav-dropdown-item">{cat.nome}</button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-mobile-categorias">
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => handleCategoriaClick(cat.nome)} className="nav-link nav-mobile-cat-link">{cat.nome}</button>
          ))}
        </div>

        {user?.papeis?.includes('ROLE_ADMIN') && (
          <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link>
        )}

        <form onSubmit={handleSearch} className="nav-mobile-search">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-mobile-search-input"
          />
        </form>
      </nav>

      <div className="header-actions">
        <button className="action-btn action-btn-search" onClick={() => setSearchOpen(!searchOpen)} title="Buscar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button className="action-btn" onClick={() => setIsCartOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        {user ? (
          <div
            ref={perfilRef}
            className="nav-dropdown nav-dropdown-perfil"
            onMouseEnter={() => setPerfilOpen(true)}
            onMouseLeave={() => setPerfilOpen(false)}
          >
            <button className="action-btn user-btn" title="Minha Conta" onClick={() => setPerfilOpen(o => !o)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            {perfilOpen && (
              <div className="nav-dropdown-menu nav-dropdown-menu-right">
                <span className="nav-dropdown-user">{user.nome}</span>
                <button onClick={() => { navigate('/cliente'); setPerfilOpen(false); }} className="nav-dropdown-item">Meus Pedidos</button>
                <button onClick={() => { navigate('/cliente?aba=favoritos'); setPerfilOpen(false); }} className="nav-dropdown-item">
                  Favoritos {favCount > 0 && <span className="nav-dropdown-fav-count">({favCount})</span>}
                </button>
                <button onClick={() => { navigate('/cliente?aba=dados'); setPerfilOpen(false); }} className="nav-dropdown-item">Meus Dados</button>
                <button onClick={() => { logout(); navigate('/'); setPerfilOpen(false); }} className="nav-dropdown-item nav-dropdown-item-logout">Sair da Conta</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="action-btn user-btn" title="Login">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        )}
      </div>

      {searchOpen && (
        <div className="header-search-bar">
          <form onSubmit={handleSearch} className="header-search-form">
            <input
              type="text"
              placeholder="O que você está procurando?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="header-search-input"
              autoFocus
            />
            <button type="submit" className="header-search-submit">Buscar</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
