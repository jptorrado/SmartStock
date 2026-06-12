import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Product = {
    id: number;
    name: string;
    barcode: string;
    price: number;
    category: string;
    estoque_atual: number; // Adicionado para exibir o estoque na tabela
};

export function Dashboard() {
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

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

    const clearForm = () => {
        setEditingId(null);
        setName('');
        setBarcode('');
        setPrice('');
        setCategory('');
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setName(product.name);
        setBarcode(product.barcode);
        setPrice(product.price.toString());
        setCategory(product.category);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Deseja realmente excluir este produto?')) return;
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccessMsg('Produto removido com sucesso.');
                loadProducts();
            } else {
                const data = await response.json();
                setErrorMsg(data.error || 'Erro ao deletar produto.');
            }
        } catch (err) {
            setErrorMsg('Erro de conexão ao tentar deletar o produto.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!name || !barcode || !price || !category) {
            setErrorMsg('Preencha todos os campos obrigatórios.');
            return;
        }

        const payload = { name, barcode, price: parseFloat(price), category };

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const url = editingId ? `${apiUrl}/products/${editingId}` : `${apiUrl}/products`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSuccessMsg(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                clearForm();
                loadProducts();
            } else {
                const data = await response.json();
                setErrorMsg(data.error || 'Erro ao salvar o produto.');
            }
        } catch (err) {
            setErrorMsg('Erro de conexão com o servidor.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    return (
        <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Topbar / Header */}
            <div style={{ backgroundColor: '#111', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    Smart<span style={{ color: '#deff9a' }}>Stock</span>
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* BOTÃO DA ISSUE US03 REINSERIDO AQUI */}
                    <button 
                        onClick={() => navigate('/estoque/entrada')} 
                        style={{ backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
                    >
                        Lançar Entrada de Estoque
                    </button>
                    
                    <button 
                        onClick={handleLogout} 
                        style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                
                {/* Form Section */}
                <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222', height: 'fit-content' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
                        {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </h2>

                    {errorMsg && <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{errorMsg}</div>}
                    {successMsg && <div style={{ backgroundColor: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{successMsg}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>Nome do Produto</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} placeholder="Ex: Arroz Tipo 1" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>Código de Barras</label>
                            <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} placeholder="Ex: 7891234567890" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>Preço (R$)</label>
                                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} placeholder="0.00" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>Categoria</label>
                                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} placeholder="Ex: Mercearia" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="submit" style={{ flex: 1, backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {editingId ? 'Atualizar' : 'Salvar'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={clearForm} style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Catálogo de Produtos</h2>

                    {products.length === 0 ? (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>Nenhum produto cadastrado até o momento.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #222' }}>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px' }}>Produto</th>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px' }}>Código</th>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px' }}>Preço</th>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px' }}>Estoque</th>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px' }}>Categoria</th>
                                    <th style={{ padding: '12px', color: '#9ca3af', fontWeight: 'normal', fontSize: '14px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #1c1c1c' }}>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{product.name}</td>
                                        <td style={{ padding: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>{product.barcode}</td>
                                        <td style={{ padding: '12px', color: '#deff9a' }}>
                                            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: product.estoque_atual > 0 ? '#6ee7b7' : '#ef4444' }}>
                                            {product.estoque_atual || 0} un
                                        </td>
                                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{product.category}</span></td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button onClick={() => startEdit(product)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
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