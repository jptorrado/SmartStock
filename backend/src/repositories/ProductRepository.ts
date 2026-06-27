import { DatabaseManager } from '../database/DatabaseManager';

export class ProductRepository {
    private db = DatabaseManager.getInstance();

    async findAll() {
        const [rows] = await this.db.execute('SELECT * FROM products ORDER BY id DESC');
        return rows;
    }

    async findByBarcode(barcode: string) {
        const [rows]: any = await this.db.execute('SELECT * FROM products WHERE barcode = ?', [barcode]);
        return rows[0] || null;
    }

    async create(product: { name: string; barcode: string; price: number; category_id: number }) {
        await this.db.execute(
            'INSERT INTO products (name, barcode, price, category_id) VALUES (?, ?, ?, ?)',
            [product.name, product.barcode, product.price, product.category_id]
        );
    }

    async update(id: number, product: { name: string; barcode: string; price: number; category_id: number }) {
        await this.db.execute(
            'UPDATE products SET name = ?, barcode = ?, price = ?, category_id = ? WHERE id = ?',
            [product.name, product.barcode, product.price, product.category_id, id]
        );
    }

    async delete(id: number) {
        await this.db.execute('DELETE FROM products WHERE id = ?', [id]);
    }
}