import { Connection } from 'mysql2/promise';

export class StockRepository {
    constructor(private db: Connection) {}

    // Alterado para buscar todos os campos (necessário para a tabela do Dashboard)
    async getAllProducts(): Promise<any[]> {
        const [rows] = await this.db.execute('SELECT * FROM products');
        return rows as any[];
    }

    async createProduct(name: string, barcode: string, price: number, category: string): Promise<void> {
        await this.db.execute(
            'INSERT INTO products (name, barcode, price, category, estoque_atual) VALUES (?, ?, ?, ?, 0)',
            [name, barcode, price, category]
        );
    }

    async updateProduct(id: number, name: string, barcode: string, price: number, category: string): Promise<void> {
        await this.db.execute(
            'UPDATE products SET name = ?, barcode = ?, price = ?, category = ? WHERE id = ?',
            [name, barcode, price, category, id]
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
}