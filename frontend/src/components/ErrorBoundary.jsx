import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>Algo deu errado</h2>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{
              padding: '0.75rem 2rem', backgroundColor: '#e63946', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
            }}
          >
            Voltar ao Início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
