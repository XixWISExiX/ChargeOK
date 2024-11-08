import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './Auth.jsx'; // Adjust the path as necessary
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <AuthProvider>
    <App />
    </AuthProvider>
  </React.StrictMode>
);
