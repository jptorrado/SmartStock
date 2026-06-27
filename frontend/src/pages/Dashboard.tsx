import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Category = {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    parent_name?: string;
    status: 'active' | 'inactive';
};

type Product = {
    id: number;
    name: string;
    barcode: string;
    price: number;
    category_id: number;
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
    
    const [activeTab, setActiveTab] = useState<'estoque' | 'categorias' | 'historico' | 'usuarios'>('estoque');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [productCategoryName, setProductCategoryName] = useState('');
    const [stockQuantities, setStockQuantities] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

    const [editingCatId, setEditingCatId] = useState<number | null>(null);
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [catParentId, setCatParentId] = useState<string>('');
    const [catStatus, setCatStatus] = useState<'active' | 'inactive'>('active');

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
            loadCategories();
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

    const loadCategories = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/categories`, { headers: getAuthHeaders() });
            if (response.ok) setCategories(await response.json());
        } catch (err) { console.error('Erro ao carregar categorias'); }
    };

    const loadProducts = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products`, { headers: getAuthHeaders() });

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
            const response = await fetch(`${apiUrl}/estoque/movimentacoes`, { headers: getAuthHeaders() });
                      
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

    // HANDLERS: CATEGORIAS
    const clearCategoryForm = () => {
        setEditingCatId(null); setCatName(''); setCatDesc(''); setCatParentId(''); setCatStatus('active');
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
        const payload = { name: catName, description: catDesc, parent_id: catParentId ? Number(catParentId) : null, status: catStatus };
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const url = editingCatId ? `${apiUrl}/categories/${editingCatId}` : `${apiUrl}/categories`;
            const method = editingCatId ? 'PUT' : 'POST';
            const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            const data = await response.json();
            if (response.ok) {
                setSuccessMsg(editingCatId ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
                clearCategoryForm(); loadCategories();
            } else { setErrorMsg(data.error || 'Erro ao processar categoria.'); }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Tem certeza? Categorias com produtos vinculados não podem ser excluídas.')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (response.ok) { setSuccessMsg('Categoria removida com sucesso.'); loadCategories(); } 
            else { const d = await response.json(); setErrorMsg(d.error); }
        } catch (err) { setErrorMsg('Erro no servidor.'); }
    };

    // HANDLERS: PRODUTOS
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

    const clearProductForm = () => {
        setEditingId(null); setName(''); setBarcode(''); setPrice(''); setProductCategoryName('');
    };

    const startEditProduct = (product: Product) => {
        setEditingId(product.id); 
        setName(product.name); 
        setBarcode(product.barcode); 
        setPrice(product.price.toString()); 
        const cat = categories.find(c => c.id === product.category_id);
        setProductCategoryName(cat ? cat.name : '');
        setActiveTab('estoque');
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
        
        const selectedCat = categories.find(c => c.name.toLowerCase() === productCategoryName.toLowerCase() && c.status === 'active');
        
        if (!selectedCat) {
            return setErrorMsg('Por favor, selecione ou digite uma categoria válida e ativa da lista.');
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        const payload = { name, barcode, price: Number(price), category_id: selectedCat.id };

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
                clearProductForm(); loadProducts();
            } else { setErrorMsg(resData.error || 'Erro ao processar o produto.'); }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm('Tem certeza de que deseja remover este produto do catálogo?')) return;
        setErrorMsg(''); setSuccessMsg('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (response.ok) {
                setSuccessMsg('Produto removido com sucesso.');
                if (editingId === id) clearProductForm();
                loadProducts();
            } else {
                const resData = await response.json(); setErrorMsg(resData.error || 'Erro ao excluir o produto.');
            }
        } catch (err) { setErrorMsg('Erro de comunicação com o servidor.'); }
    };

    // HANDLERS: USUÁRIOS
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

    // MOTORES DE ÁRVORE E BUSCA FACETADA
    const getCategoryName = (id: number) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'Categoria Inválida';
    };

    const getDescendantCategoryIds = (categoryId: number): number[] => {
        let ids = [categoryId]; 
        const children = categories.filter(c => c.parent_id === categoryId);
        children.forEach(child => {
            ids = [...ids, ...getDescendantCategoryIds(child.id)];
        });
        return ids;
    };

    const getAncestorCategoryIds = (categoryId: number): number[] => {
        let ids = [categoryId];
        const cat = categories.find(c => c.id === categoryId);
        if (cat && cat.parent_id) {
            ids = [...ids, ...getAncestorCategoryIds(cat.parent_id)];
        }
        return ids;
    };

    const getCategoryProductCount = (categoryId: number): number => {
        const directProductsCount = products.filter(p => p.category_id === categoryId).length;
        const childCategories = categories.filter(c => c.parent_id === categoryId);
        const childProductsCount = childCategories.reduce((total, child) => {
            return total + getCategoryProductCount(child.id);
        }, 0);
        return directProductsCount + childProductsCount;
    };

    const textMatchedProducts = products.filter(product => {
        if (!searchTerm) return true;
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               product.barcode.includes(searchTerm);
    });

    const validCategoryIdsForFilter = new Set<number>();
    textMatchedProducts.forEach(p => {
        getAncestorCategoryIds(p.category_id).forEach(id => validCategoryIdsForFilter.add(id));
    });

    const availableCategoriesForFilter = categories.filter(c => validCategoryIdsForFilter.has(c.id));

    const filteredProducts = textMatchedProducts.filter(product => {
        if (selectedCategoryFilter === '') return true;
        
        const selectedCat = categories.find(c => c.name.toLowerCase() === selectedCategoryFilter.toLowerCase());
        if (!selectedCat) return false; 

        const validIds = getDescendantCategoryIds(selectedCat.id);
        return validIds.includes(product.category_id);
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
                            onClick={() => setActiveTab('categorias')} 
                            style={{ backgroundColor: activeTab === 'categorias' ? '#deff9a' : 'transparent', color: activeTab === 'categorias' ? '#000' : '#9ca3af', border: activeTab === 'categorias' ? 'none' : '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            📁 Categorias
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
                                    required={!editingUserId}
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

            {/* ABA DE CATEGORIAS */}
            {activeTab === 'categorias' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }}>
                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222', height: 'fit-content' }}>
                        <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>{editingCatId ? '📝 Editar Categoria' : '➕ Nova Categoria'}</h2>
                        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Nome da Categoria</label>
                                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Breve Descrição</label>
                                <input type="text" value={catDesc} onChange={e => setCatDesc(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Subcategoria de (Opcional)</label>
                                <select value={catParentId} onChange={e => setCatParentId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }}>
                                    <option value="">Nenhuma (Categoria Raiz)</option>
                                    {categories.filter(c => c.id !== editingCatId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>Status Operacional</label>
                                <select value={catStatus} onChange={e => setCatStatus(e.target.value as 'active'|'inactive')} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff' }}>
                                    <option value="active">Ativa (Visível no Estoque)</option>
                                    <option value="inactive">Inativa (Oculta/Arquivada)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{editingCatId ? 'Salvar Edição' : 'Criar Categoria'}</button>
                                {editingCatId && <button type="button" onClick={clearCategoryForm} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>}
                            </div>
                        </form>
                    </div>

                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222' }}>
                        <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>🗂️ Árvore de Categorias</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #222', color: '#9ca3af', fontSize: '14px' }}>
                                    <th style={{ padding: '12px' }}>Nome / Hierarquia</th>
                                    <th style={{ padding: '12px' }}>Descrição</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Qtd. Produtos</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => {
                                    const productCount = getCategoryProductCount(cat.id);
                                    
                                    return (
                                        <tr key={cat.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{cat.name}</div>
                                                {cat.parent_name && <div style={{ fontSize: '12px', color: '#9ca3af' }}>↳ Sub de: {cat.parent_name}</div>}
                                            </td>
                                            <td style={{ padding: '12px', color: '#9ca3af', fontSize: '13px' }}>{cat.description || '-'}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: productCount > 0 ? '#deff9a' : '#6b7280' }}>
                                                    {productCount}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ backgroundColor: cat.status === 'active' ? '#064e3b' : '#7f1d1d', color: cat.status === 'active' ? '#6ee7b7' : '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {cat.status === 'active' ? 'ATIVA' : 'INATIVA'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <button onClick={() => { setEditingCatId(cat.id); setCatName(cat.name); setCatDesc(cat.description || ''); setCatParentId(cat.parent_id ? cat.parent_id.toString() : ''); setCatStatus(cat.status); window.scrollTo(0, 0); }} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }}>Editar</button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ABA ESTOQUE */}
            {activeTab === 'estoque' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '30px' }}>
                    <div style={{ backgroundColor: '#111111', padding: '25px', borderRadius: '8px', border: '1px solid #222', height: 'fit-content' }}>
                        <h2 style={{ color: '#deff9a', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                            {editingId ? '📝 Editar Cadastro' : '➕ Adicionar ao Catálogo'}
                        </h2>
                        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
                                    <label style={{ fontSize: '13px', color: '#9ca3af' }}>Categoria</label>
                                    <input 
                                        list="form-categories"
                                        placeholder="🗂️ Selecione ou digite..."
                                        value={productCategoryName} 
                                        onChange={e => setProductCategoryName(e.target.value)} 
                                        required 
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} 
                                    />
                                    {productCategoryName && (
                                        <button 
                                            type="button"
                                            onClick={() => setProductCategoryName('')} 
                                            style={{ position: 'absolute', right: '10px', top: '30px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <datalist id="form-categories">
                                        {categories.filter(c => c.status === 'active').map(c => (
                                            <option key={c.id} value={c.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <button type="button" onClick={() => setActiveTab('categorias')} title="Gerenciar Categorias" style={{ backgroundColor: '#222', color: '#deff9a', border: '1px solid #333', padding: '0 15px', height: '39px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
                                    +
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#deff9a', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editingId ? 'Atualizar' : 'Cadastrar Produto'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={clearProductForm} style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
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
                            
                            <div style={{ position: 'relative', width: '300px' }}>
                                <input 
                                    list="dynamic-categories"
                                    placeholder="🗂️ Filtrar por Categoria..."
                                    value={selectedCategoryFilter}
                                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                                {selectedCategoryFilter && (
                                    <button 
                                        onClick={() => setSelectedCategoryFilter('')} 
                                        style={{ position: 'absolute', right: '10px', top: '12px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                        title="Limpar filtro de categoria"
                                    >
                                        ✕
                                    </button>
                                )}
                                <datalist id="dynamic-categories">
                                    {availableCategoriesForFilter.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>
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
                                                <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                                                    {getCategoryName(product.category_id)}
                                                </span>
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
                                                <button onClick={() => startEditProduct(product)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                                <button onClick={() => handleDeleteProduct(product.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ABA HISTORICO */}
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