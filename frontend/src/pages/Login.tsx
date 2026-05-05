import React, { useState } from 'react';

export const Login = () => {
    // Estados para armazenar o que o usuário digita
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Função engatilhada quando o formulário é submetido
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Impede a página de recarregar
        setErrorMsg(''); // Limpa erros antigos

        try {
            const response = await fetch('http://localhost:3000/login', {
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

            const data = await response.json();
            
            // Sucesso! Por enquanto, apenas exibimos no console.
            console.log('Login Bem-Sucedido:', data);
            alert(`Bem-vindo, ${data.user.name}!`);

        } catch (error: any) {
            console.error('Erro no login:', error.message);
            setErrorMsg(error.message);
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