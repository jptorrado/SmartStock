import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={{ padding: '40px', color: '#fff', backgroundColor: '#000', minHeight: '100vh' }}>
            <h1 style={{ color: '#deff9a' }}>Bem-vindo ao SmartStock</h1>
            <p>Seu controle de estoque profissional começa aqui.</p>
            <button onClick={handleLogout} style={{ padding: '10px', cursor: 'pointer' }}>Sair</button>
        </div>
    );
}