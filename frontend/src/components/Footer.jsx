import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2 className="footer-brand">LF CLOTHING</h2>
          <p className="footer-brand-text">A loja de roupas masculinas que dita a moda em Campina Grande com estilo, força e qualidade.</p>
        </div>
        <div>
          <h3 className="footer-section-title">Navegação</h3>
          <ul className="footer-list">
            <li><Link to="/" className="footer-link">Início</Link></li>
            <li><Link to="/catalogo" className="footer-link">Catálogo</Link></li>
            <li><Link to="/cliente" className="footer-link">Minha Conta</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="footer-section-title">Institucional</h3>
          <ul className="footer-list">
            <li><span className="footer-link-disabled">Sobre a LF</span></li>
            <li><span className="footer-link-disabled">Trocas e Devoluções</span></li>
            <li><span className="footer-link-disabled">Termos de Uso</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} LF Clothing. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
