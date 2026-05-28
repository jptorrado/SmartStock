import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Adicionado: Hook de navegação do React Router

type LoginResponse = {
    user?: {
        token?: string;
    };
};

export const Login = () => {
    // Estados para armazenar o que o usuário digita
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // 2. Adicionado: Instância do navegador
    const navigate = useNavigate(); 

    // Função engatilhada quando o formulário é submetido
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Impede a página de recarregar
        setErrorMsg(''); // Limpa erros antigos

        try {
            const apiUrl = import.meta.env.VITE_API_URL?.trim();

            if (!apiUrl) {
                throw new Error('Configuração ausente: defina VITE_API_URL para conectar ao servidor.');
            }

            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // O tratamento obrigatório do fetch que discutimos
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha na autenticação');
            }

            const data: LoginResponse = await response.json();
            const token = data.user?.token;

            if (!token) {
                throw new Error('Token não retornado na autenticação.');
            }
            
            // 3. Adicionado: Lógica Sênior de Sucesso (Sessão e Redirecionamento)
            console.log('Login Bem-Sucedido:', data);
            
            // Salva o "crachá" (Token) no navegador do usuário
            localStorage.setItem('token', token); 
            
            // Redireciona imediatamente para o painel principal, cumprindo o critério da US01
            navigate('/dashboard'); 

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro no login.';
            console.error('Erro no login:', message);
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
