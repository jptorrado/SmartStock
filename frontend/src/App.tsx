import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard'; // Certifique-se de que o caminho do arquivo está correto

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial: Tela de Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota protegida: Painel Principal */}
        <Route
          path="/dashboard"
          element={localStorage.getItem('token') ? <Dashboard /> : <Navigate to="/" replace />}
        />
        
        {/* Rota de Fallback: Se o usuário digitar qualquer URL maluca, joga pro Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;