import { DatabaseManager } from '../database/DatabaseManager';

export class StockRepository {
    // 1. Injeção do Padrão Singleton
    private db = DatabaseManager.getInstance();

    // Alterado para buscar todos os campos (necessário para a tabela do Dashboard)
    async getAllProducts(): Promise<any[]> {
        const [rows] = await this.db.execute('SELECT * FROM products');
        return rows as any[];
    }

    // 2. Alteração de 'category: string' para 'category_id: number'
    async createProduct(name: string, barcode: string, price: number, category_id: number): Promise<void> {
        await this.db.execute(
            'INSERT INTO products (name, barcode, price, category_id, estoque_atual) VALUES (?, ?, ?, ?, 0)',
            [name, barcode, price, category_id]
        );
    }

    // 2. Alteração de 'category: string' para 'category_id: number'
    async updateProduct(id: number, name: string, barcode: string, price: number, category_id: number): Promise<void> {
        await this.db.execute(
            'UPDATE products SET name = ?, barcode = ?, price = ?, category_id = ? WHERE id = ?',
            [name, barcode, price, category_id, id]
        );
    }

    async deleteProduct(id: number): Promise<void> {
        await this.db.execute('DELETE FROM products WHERE id = ?', [id]);
    }

    async registerEntry(produtoId: number, quantidade: number): Promise<void> {
        await this.db.execute(
            'UPDATE products SET estoque_atual = estoque_atual + ? WHERE id = ?',
            [quantidade, produtoId]
        );

        await this.db.execute(
            'INSERT INTO movimentacoes (produto_id, quantidade, tipo) VALUES (?, ?, ?)',
            [produtoId, quantidade, 'entrada']
        );
    }

    // --- MÉTODOS NOVOS DA US04 ---
    async getStock(produtoId: number): Promise<number> {
        const [rows]: any = await this.db.execute('SELECT estoque_atual FROM products WHERE id = ?', [produtoId]);
        if (rows.length === 0) throw new Error('Produto não encontrado.');
        return rows[0].estoque_atual;
    }

    async registerOutput(produtoId: number, quantidade: number): Promise<void> {
        // Deduz o estoque
        await this.db.execute(
            'UPDATE products SET estoque_atual = estoque_atual - ? WHERE id = ?',
            [quantidade, produtoId]
        );
        
        // Gera o registro na tabela de movimentações (Auditoria)
        await this.db.execute(
            'INSERT INTO movimentacoes (produto_id, quantidade, tipo) VALUES (?, ?, ?)',
            [produtoId, quantidade, 'saida']
        );
    }
    
    async getMovements(): Promise<any[]> {
        const [rows] = await this.db.execute(`
            SELECT m.id, m.tipo, m.quantidade, m.data_hora, p.name AS produto_nome 
            FROM movimentacoes m 
            JOIN products p ON m.produto_id = p.id 
            ORDER BY m.id DESC 
            LIMIT 100
        `);
        return rows as any[];
    }
}