import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/print.css';

// basename comes from Vite `base` (/kh/). Strip the trailing slash so
// react-router matches /kh, /kh/explore, etc.
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
