import React from 'react';
import './Loading.css';

const Loading = ({ texto = 'Carregando...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{texto}</p>
    </div>
  );
};

export default Loading;
