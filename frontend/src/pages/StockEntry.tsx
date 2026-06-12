import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Product = {
    id: number;
    name: string;
    estoque_atual: number;
};

export const StockEntry = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // Bloqueia o acesso se não estiver logado
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
        } else {
            fetchProducts();
        }
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            // CORREÇÃO: Agora ele busca na mesma rota que o Dashboard usa!
            const response = await fetch(`${apiUrl}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setErrorMsg('Falha ao carregar lista de produtos.');
            }
        } catch (error) {
            setErrorMsg('Erro de conexão ao buscar produtos.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            
            // Atenção: Certifique-se de que no backend/src/index.ts a sua rota seja app.post('/estoque/entrada', ...)
            const response = await fetch(`${apiUrl}/estoque/entrada`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    produtoId: Number(selectedProductId), 
                    quantidade: Number(quantity) 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao registrar entrada.');
            }

            setSuccessMsg('Entrada de estoque registrada com sucesso!');
            setQuantity('');
            setSelectedProductId('');
            
            // Recarrega os produtos para atualizar o saldo no select
            fetchProducts();
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    return (
        <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Topbar / Header (Mesmo do Dashboard) */}
            <div style={{ backgroundColor: '#111', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    Smart<span style={{ color: '#deff9a' }}>Stock</span>
                </h1>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Voltar ao Dashboard
                </button>
            </div>

            {/* Conteúdo Principal */}
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px' }}>
                <div style={{ backgroundColor: '#111', padding: '32px', borderRadius: '12px', border: '1px solid #222' }}>
                    <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Lançamento de Entrada</h2>

                    {errorMsg && <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{errorMsg}</div>}
                    {successMsg && <div style={{ backgroundColor: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{successMsg}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Produto Existente</label>
                            <select 
                                value={selectedProductId} 
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }}
                            >
                                <option value="" disabled>Selecione um produto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — Saldo Atual: {p.estoque_atual || 0}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>Quantidade Recebida</label>
                            <input 
                                type="number" 
                                min="1"
                                placeholder="Ex: 50"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                            />
                        </div>
                        
                        <button type="submit" style={{ marginTop: '10px', backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                            Somar ao Estoque
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};