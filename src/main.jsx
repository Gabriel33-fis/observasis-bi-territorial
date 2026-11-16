import React from 'react';
import ReactDOM from 'react-dom/client';
import { Chart as ChartJS } from 'chart.js';
import App from './App.jsx';
import './index.css';

// Eixos e dicas dos gráficos no padrão brasileiro (vírgula decimal)
ChartJS.defaults.locale = 'pt-BR';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

