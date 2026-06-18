import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ADIÇÃO US06: Tipagem atualizada para reconhecer o campo 'role' vindo do Backend
type LoginResponse = {
    user?: {
        token?: string;
        role?: string;
    };
    token?: string;
    role?: string;
};

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const navigate = useNavigate(); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setErrorMsg(''); 

        try {
            const apiUrl = import.meta.env.VITE_API_URL?.trim();

            if (!apiUrl) {
                throw new Error('Configuração ausente: defina VITE_API_URL.');
            }

            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha na autenticação');
            }

            const data: LoginResponse = await response.json();
            
            // ADIÇÃO US06: Captura do token e do nível de acesso (role)
            const token = data.user?.token || data.token;
            const role = data.user?.role || data.role;

            if (!token) {
                throw new Error('Token não retornado na autenticação.');
            }
            
            localStorage.setItem('token', token); 
            
            // ADIÇÃO US06: Salva o role no navegador para o Dashboard saber quem é o usuário
            if (role) {
                localStorage.setItem('role', role);
            }
            
            navigate('/dashboard', { replace: true }); 

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro no login.';
            setErrorMsg(message);
        }
    };

    return (
        /* Fundo Preto Puro e alinhamento flex centralizado */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000000', color: '#fff', fontFamily: 'sans-serif' }}>
            
            {/* Card de Login alinhado com o design do Dashboard */}
            <div style={{ backgroundColor: '#111111', padding: '40px', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#deff9a', margin: 0, fontSize: '28px' }}>SmartStock</h2>
                    <p style={{ color: '#9ca3af', margin: '5px 0 0 0', fontSize: '14px' }}>Controle de Acesso Seguro</p>
                </div>
                
                {errorMsg && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>❌ {errorMsg}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', color: '#9ca3af' }}>E-mail corporativo</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', color: '#9ca3af' }}>Senha</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                        Entrar no Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};