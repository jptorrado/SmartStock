export function Dashboard() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ padding: '40px', color: '#fff', backgroundColor: '#000', minHeight: '100vh' }}>
            <h1 style={{ color: '#deff9a' }}>Bem-vindo ao SmartStock</h1>
            <p>Seu controle de estoque profissional começa aqui.</p>
            <button onClick={handleLogout} style={{ padding: '10px', cursor: 'pointer' }}>Sair</button>
        </div>
    );
}