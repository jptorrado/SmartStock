import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type LoginResponse = {
    user?: {
        token?: string;
    };
    token?: string;
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
            
            const token = data.user?.token || data.token;

            if (!token) {
                throw new Error('Token não retornado na autenticação.');
            }
            
            localStorage.setItem('token', token); 
            
            navigate('/dashboard', { replace: true }); 

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro no login.';
            setErrorMsg(message);
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Login SmartStock</h2>
            {errorMsg && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};