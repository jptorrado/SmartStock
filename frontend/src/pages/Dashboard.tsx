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

type Movement = {
    id: number;
    produto_nome: string;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    data_hora: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'operator';
};

export function Dashboard() {
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'estoque' | 'historico' | 'usuarios'>('estoque');
    
    const [movements, setMovements] = useState<Movement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    const [stockQuantities, setStockQuantities] = useState<Record<number, string>>({});

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // ESTADOS DE USUÁRIO
    const [users, setUsers] = useState<User[]>([]);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userRole, setUserRole] = useState<'admin' | 'operator'>('operator');
    
    const userRoleLocal = localStorage.getItem('role');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
        } else {
            loadProducts();
            loadMovements();
            if (userRoleLocal === 'admin') {
                loadUsers();
            }
        }
    }, [navigate, userRoleLocal]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (successMsg || errorMsg) {
            timer = setTimeout(() => {
                setSuccessMsg('');
                setErrorMsg('');
            }, 5000); 
        }
        return () => clearTimeout(timer);
    }, [successMsg, errorMsg]);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

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

    const loadMovements = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/estoque/movimentacoes`);
            if (response.ok) {
                const data = await response.json();
                setMovements(data);
            }
        } catch (err) {
            console.error('Erro ao carregar movimentações');
        }
    };

    const loadUsers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/users`, { headers: getAuthHeaders() });
            if (response.ok) setUsers(await response.json());
        } catch (err) { console.error('Erro ao carregar usuários'); }
    };

    const handleAddStock = async (productId: number) => {
        setErrorMsg(''); setSuccessMsg('');
        const qtyStr = stockQuantities[productId];
        const quantity = Number(qtyStr);

        if (!qtyStr || isNaN(quantity) || quantity <= 0) {
            setErrorMsg('Informe uma quantidade válida e maior que zero para a entrada.');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/estoque/entrada`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ produtoId: productId, quantidade: quantity }),
            });
            const resData = await response.json();
            if (response.ok) {
                setSuccessMsg(`Estoque atualizado com sucesso!`);
                setStockQuantities(prev => ({ ...prev, [productId]: '' }));
                loadProducts(); loadMovements();
            } else { setErrorMsg(resData.error || 'Erro ao processar a entrada de estoque.'); }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    const handleDeductStock = async (productId: number) => {
        setErrorMsg(''); setSuccessMsg('');
        const qtyStr = stockQuantities[productId];
        const quantity = Number(qtyStr);

        if (!qtyStr || isNaN(quantity) || quantity <= 0) {
            setErrorMsg('Informe uma quantidade válida e maior que zero para a baixa.');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/estoque/saida`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ produtoId: productId, quantidade: quantity }),
            });
            const resData = await response.json();
            if (response.ok) {
                setSuccessMsg(`Baixa de estoque registrada com sucesso!`);
                setStockQuantities(prev => ({ ...prev, [productId]: '' }));
                loadProducts(); loadMovements();
            } else { setErrorMsg(resData.error || 'Erro ao processar a baixa de estoque.'); }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    const handleStockInputChange = (productId: number, value: string) => {
        setStockQuantities(prev => ({ ...prev, [productId]: value }));
    };

    const clearForm = () => {
        setEditingId(null); setName(''); setBarcode(''); setPrice(''); setCategory('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
        const apiUrl = import.meta.env.VITE_API_URL;
        const payload = { name, barcode, price: Number(price), category };

        try {
            let response;
            if (editingId) {
                response = await fetch(`${apiUrl}/products/${editingId}`, {
                    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`${apiUrl}/products`, {
                    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload),
                });
            }

            const resData = await response.json();
            if (response.ok) {
                setSuccessMsg(editingId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                clearForm(); loadProducts();
            } else { setErrorMsg(resData.error || 'Erro ao processar o produto.'); }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id); setName(product.name); setBarcode(product.barcode); setPrice(product.price.toString()); setCategory(product.category);
        setActiveTab('estoque');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza de que deseja remover este produto do catálogo?')) return;
        setErrorMsg(''); setSuccessMsg('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (response.ok) {
                setSuccessMsg('Produto removido com sucesso.');
                if (editingId === id) clearForm();
                loadProducts();
            } else {
                const resData = await response.json(); setErrorMsg(resData.error || 'Erro ao excluir o produto.');
            }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    // FUNÇÕES DE USUÁRIO EXPANDIDAS
    const clearUserForm = () => {
        setEditingUserId(null); setUserName(''); setUserEmail(''); setUserPassword(''); setUserRole('operator');
    };

    const startEditUser = (user: User) => {
        setEditingUserId(user.id); setUserName(user.name); setUserEmail(user.email); setUserRole(user.role); setUserPassword('');
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const url = editingUserId ? `${apiUrl}/users/${editingUserId}` : `${apiUrl}/users`;
            const method = editingUserId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method, headers: getAuthHeaders(),
                body: JSON.stringify({ name: userName, email: userEmail, password: userPassword, role: userRole })
            });
            const data = await response.json();
            
            if (response.ok) {
                setSuccessMsg(editingUserId ? 'Credencial atualizada com sucesso!' : 'Usuário criado com sucesso!');
                clearUserForm(); loadUsers();
            } else { setErrorMsg(data.error || 'Erro ao salvar usuário.'); }
        } catch (err) { setErrorMsg('Erro no servidor.'); }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Excluir este usuário? O acesso dele será revogado.')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (response.ok) { setSuccessMsg('Usuário removido.'); loadUsers(); } 
            else { const d = await response.json(); setErrorMsg(d.error); }
        } catch (err) { setErrorMsg('Erro no servidor.'); }
    };

    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();

    const filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === '' || product.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div style={{ padding: '40px', color: '#f3f4f6', backgroundColor: '#000000', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#deff9a', margin: 0, fontSize: '28px' }}>SmartStock</h1>
                    
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <button 
                            onClick={() => setActiveTab('estoque')} 
                            style={{ backgroundColor: activeTab === 'estoque' ? '#deff9a' : 'transparent', color: activeTab === 'estoque' ? '#000' : '#9ca3af', border: activeTab === 'estoque' ? 'none' : '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            📦 Gestão de Estoque
                        </button>
                        <button 
                            onClick={() => setActiveTab('historico')} 
                            style={{ backgroundColor: activeTab === 'historico' ? '#deff9a' : 'transparent', color: activeTab === 'historico' ? '#000' : '#9ca3af', border: activeTab === 'historico' ? 'none' : '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            🕒 Histórico de Movimentações
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {userRoleLocal === 'admin' && (
                        <button 
                            onClick={() => setActiveTab('usuarios')} 
                            style={{ backgroundColor: activeTab === 'usuarios' ? '#3b82f6' : 'transparent', color: activeTab === 'usuarios' ? '#fff' : '#60a5fa', border: '1px solid #3b82f6', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            👥 Gerenciar Usuários
                        </button>
                    )}
                    <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
                </div>
            </div>

            <div style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                {errorMsg && (
                    <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '15px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
                        <span>❌ {errorMsg}</span>
                        <button onClick={() => setErrorMsg('')} style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '16px', cursor: 'pointer', padding: '0 5px' }}>✕</button>
                    </div>
                )}
                
                {successMsg && (
                    <div style={{ backgroundColor: '#064e3b', color: '#6ee7b7', padding: '15px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
                        <span>✅ {successMsg}</span>
                        <button onClick={() => setSuccessMsg('')} style={{ background: 'transparent', border: 'none', color: '#6ee7b7', fontSize: '16px', cursor: 'pointer', padding: '0 5px' }}>✕</button>
                    </div>
                )}
            </div>

            {/* ABA DE USUÁRIOS */}
            {activeTab === 'usuarios' && userRoleLocal === 'admin' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }}>
                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222', height: 'fit-content' }}>
                        <h2 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                            {editingUserId ? '📝 Editar Operador' : '➕ Cadastrar Operador'}
                        </h2>
                        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Nome Completo</label>
                                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>E-mail de Acesso</label>
                                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Senha de Acesso</label>
                                <input 
                                    type="password" 
                                    value={userPassword} 
                                    onChange={(e) => setUserPassword(e.target.value)} 
                                    required={!editingUserId} // A senha só é obrigatória na criação
                                    placeholder={editingUserId ? "Deixe em branco para manter a atual" : "••••••••"}
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} 
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Nível de Permissão</label>
                                <select value={userRole} onChange={(e) => setUserRole(e.target.value as 'admin' | 'operator')} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', cursor: 'pointer' }}>
                                    <option value="operator">Operador Comum</option>
                                    <option value="admin">Administrador (Total)</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editingUserId ? 'Salvar Edição' : 'Criar Credencial'}
                                </button>
                                {editingUserId && (
                                    <button type="button" onClick={clearUserForm} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}>
                        <h2 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>🔐 Controle de Acesso Ativo</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #222', color: '#9ca3af', fontSize: '14px' }}>
                                    <th style={{ padding: '12px' }}>Usuário</th>
                                    <th style={{ padding: '12px' }}>Nível de Acesso</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Ações de Segurança</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ backgroundColor: user.role === 'admin' ? '#1e3a8a' : '#222', color: user.role === 'admin' ? '#93c5fd' : '#d1d5db', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button onClick={() => startEditUser(user)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Editar</button>
                                            <button onClick={() => handleDeleteUser(user.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ABA ESTOQUE E ABA HISTORICO MANTIDAS IGUAIS */}
            {activeTab === 'estoque' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }}>
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
                                <input 
                                    type="text" 
                                    value={barcode} 
                                    onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))} 
                                    required 
                                    inputMode="numeric"
                                    pattern="\d+"
                                    title="O código de barras deve conter apenas números"
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Preço de Venda (R$)</label>
                                <input 
                                    type="text" 
                                    value={price} 
                                    onChange={(e) => {
                                        let sanitized = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                        setPrice(sanitized);
                                    }} 
                                    required 
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Categoria</label>
                                <input 
                                    type="text" 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    required 
                                    placeholder="Ex: Mercearia, Bebidas" 
                                    list="category-suggestions" 
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} 
                                />
                                <datalist id="category-suggestions">
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
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

                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}>
                        <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>📋 Estoque</h2>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <input 
                                type="text" 
                                placeholder="🔍 Buscar por Nome ou Código de Barras..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', fontSize: '14px' }}
                            />
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ width: '220px', padding: '12px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
                            >
                                <option value="">Todas as Categorias</option>
                                {uniqueCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        {filteredProducts.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: '16px' }}>
                                {products.length === 0 
                                    ? "Nenhum produto cadastrado." 
                                    : "Nenhum produto encontrado correspondente a este filtro."}
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #222', color: '#9ca3af', fontSize: '14px' }}>
                                        <th style={{ padding: '12px' }}>Produto</th>
                                        <th style={{ padding: '12px' }}>Preço</th>
                                        <th style={{ padding: '12px' }}>Categoria</th>
                                        <th style={{ padding: '12px' }}>Quantidade</th>
                                        <th style={{ padding: '12px' }}>Movimentação</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
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
                                            <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '16px', color: product.estoque_atual > 0 ? '#fff' : '#ef4444' }}>
                                                {product.estoque_atual} un.
                                            </td>
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
                                                    <button onClick={() => handleAddStock(product.id)} style={{ backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ Entrada</button>
                                                    <button onClick={() => handleDeductStock(product.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>- Saída</button>
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
            )}

            {activeTab === 'historico' && (
                <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}>
                    <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>🧾 Registro de Auditoria</h2>
                    
                    {movements.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>Não há histórico de movimentações registrado no sistema.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #222', color: '#9ca3af', fontSize: '14px' }}>
                                    <th style={{ padding: '12px' }}>ID Registro</th>
                                    <th style={{ padding: '12px' }}>Produto</th>
                                    <th style={{ padding: '12px' }}>Operação</th>
                                    <th style={{ padding: '12px' }}>Quantidade</th>
                                    <th style={{ padding: '12px' }}>Data e Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((mov) => (
                                    <tr key={mov.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '12px', color: '#6b7280', fontFamily: 'monospace' }}>#{mov.id}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{mov.produto_nome}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                backgroundColor: mov.tipo === 'entrada' ? '#064e3b' : '#7f1d1d', 
                                                color: mov.tipo === 'entrada' ? '#6ee7b7' : '#fca5a5', 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' 
                                            }}>
                                                {mov.tipo}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{mov.quantidade} un.</td>
                                        <td style={{ padding: '12px', color: '#9ca3af' }}>{new Date(mov.data_hora).toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}