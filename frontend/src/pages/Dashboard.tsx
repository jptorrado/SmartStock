import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Product = {
    id: number;
    name: string;
    barcode: string;
    price: number;
    category: string;
    estoque_atual: number;
};

export function Dashboard() {
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Estados do Formulário de Cadastro/Edição
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    // Estado para controlar os inputs de quantidade de estoque de cada linha (chaveado pelo id do produto)
    const [stockQuantities, setStockQuantities] = useState<Record<number, string>>({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
        } else {
            loadProducts();
        }
    }, [navigate]);

    const loadProducts = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setErrorMsg('Falha ao carregar catálogo de produtos.');
            }
        } catch (err) {
            setErrorMsg('Erro de conexão ao buscar produtos.');
        }
    };

    // Função para processar o clique de Adicionar Estoque na linha do produto
    const handleAddStock = async (productId: number) => {
        setErrorMsg('');
        setSuccessMsg('');

        const qtyStr = stockQuantities[productId];
        const quantity = Number(qtyStr);

        if (!qtyStr || isNaN(quantity) || quantity <= 0) {
            setErrorMsg('Informe uma quantidade válida e maior que zero para a entrada.');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            // Sincronizado estritamente com o controlador do seu amigo (/estoque/entrada)
            const response = await fetch(`${apiUrl}/estoque/entrada`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    produtoId: productId, 
                    quantidade: quantity 
                }),
            });

            const resData = await response.json();

            if (response.ok) {
                setSuccessMsg(`Estoque atualizado com sucesso!`);
                // Limpa o input de quantidade específico desse produto
                setStockQuantities(prev => ({ ...prev, [productId]: '' }));
                loadProducts(); // Recarrega os dados para exibir o novo estoque_atual
            } else {
                setErrorMsg(resData.error || 'Erro ao processar a entrada de estoque.');
            }
        } catch (err) {
            setErrorMsg('Erro de comunicação com o servidor.');
        }
    };

    const handleStockInputChange = (productId: number, value: string) => {
        setStockQuantities(prev => ({ ...prev, [productId]: value }));
    };

    const clearForm = () => {
        setEditingId(null);
        setName('');
        setBarcode('');
        setPrice('');
        setCategory('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const apiUrl = import.meta.env.VITE_API_URL;
        const payload = { name, barcode, price: Number(price), category };

        try {
            let response;
            if (editingId) {
                response = await fetch(`${apiUrl}/products/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`${apiUrl}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const resData = await response.json();

            if (response.ok) {
                setSuccessMsg(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                clearForm();
                loadProducts();
            } else {
                setErrorMsg(resData.error || 'Erro ao processar o produto.');
            }
        } catch (err) {
            setErrorMsg('Erro de comunicação com o servidor.');
        }
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setName(product.name);
        setBarcode(product.barcode);
        setPrice(product.price.toString());
        setCategory(product.category);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza de que deseja remover este produto do catálogo?')) return;
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products/${id}`, { method: 'DELETE' });

            if (response.ok) {
                setSuccessMsg('Produto removido com sucesso.');
                if (editingId === id) clearForm();
                loadProducts();
            } else {
                const resData = await response.json();
                setErrorMsg(resData.error || 'Erro ao excluir o produto.');
            }
        } catch (err) {
            setErrorMsg('Erro de comunicação com o servidor.');
        }
    };

    return (
        <div style={{ padding: '40px', color: '#f3f4f6', backgroundColor: '#000000', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Header Limpo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#deff9a', margin: 0, fontSize: '28px' }}>SmartStock — Painel de Controle</h1>
                    <p style={{ margin: '5px 0 0', color: '#9ca3af', fontSize: '14px' }}>Gestão Integrada de Catálogo e Inventário</p>
                </div>
                <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
            </div>

            {errorMsg && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>❌ {errorMsg}</div>}
            {successMsg && <div style={{ backgroundColor: '#064e3b', color: '#6ee7b7', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>✅ {successMsg}</div>}

            {/* Layout de Duas Colunas Simultâneas: Cadastro à Esquerda, Grid à Direita */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }}>
                
                {/* Coluna 1: Formulário de Cadastro/Edição */}
                <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222', height: 'fit-content' }}>
                    <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                        {editingId ? '📝 Editar Cadastro' : '➕ Adicionar ao Catálogo'}
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', color: '#9ca3af' }}>Nome do Produto</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', color: '#9ca3af' }}>Código de Barras</label>
                            <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', color: '#9ca3af' }}>Preço de Venda (R$)</label>
                            <input type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', color: '#9ca3af' }}>Categoria</label>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="Ex: Mercearia, Bebidas" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {editingId ? 'Atualizar' : 'Cadastrar Produto'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={clearForm} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Coluna 2: Tabela de Inventário Real-Time */}
                <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}>
                    <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>📋 Catálogo e Balanço de Estoque</h2>
                    
                    {products.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>Nenhum produto cadastrado.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #222', color: '#9ca3af', fontSize: '14px' }}>
                                    <th style={{ padding: '12px' }}>Produto</th>
                                    <th style={{ padding: '12px' }}>Preço</th>
                                    <th style={{ padding: '12px' }}>Categoria</th>
                                    <th style={{ padding: '12px' }}>Saldo Atual</th>
                                    <th style={{ padding: '12px' }}>Movimentação Rápida</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #222', height: '60px' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{product.barcode}</div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#deff9a' }}>
                                            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{product.category}</span>
                                        </td>
                                        
                                        {/* Monitor de Saldo do Inventário */}
                                        <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '16px', color: product.estoque_atual > 0 ? '#fff' : '#ef4444' }}>
                                            {product.estoque_atual} un.
                                        </td>

                                        {/* PAINEL CONTEXTUAL EXCLUSIVO: Input + Botão por linha */}
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    placeholder="Qtd"
                                                    value={stockQuantities[product.id] || ''}
                                                    onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                                                    style={{ width: '65px', padding: '6px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', textAlign: 'center' }}
                                                />
                                                <button 
                                                    onClick={() => handleAddStock(product.id)}
                                                    style={{ backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                                    title="Dar entrada de estoque"
                                                >
                                                    + Entrada
                                                </button>
                                                {/* Futuramente o botão de deduzir entra aqui perfeitamente alinhado */}
                                            </div>
                                        </td>

                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button onClick={() => startEdit(product)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                            <button onClick={() => handleDelete(product.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}