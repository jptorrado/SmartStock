import { Connection } from 'mysql2/promise';

export class ProductRepository {
    constructor(private connection: Connection) {}

    async findAll() {
        const [rows] = await this.connection.query('SELECT * FROM products ORDER BY id DESC');
        return rows;
    }

    async findByBarcode(barcode: string) {
        const [rows]: any = await this.connection.query('SELECT * FROM products WHERE barcode = ?', [barcode]);
        return rows[0] || null;
    }

    async create(product: { name: string; barcode: string; price: number; category: string }) {
        await this.connection.query(
            'INSERT INTO products (name, barcode, price, category) VALUES (?, ?, ?, ?)',
            [product.name, product.barcode, product.price, product.category]
        );
    }

    async update(id: number, product: { name: string; barcode: string; price: number; category: string }) {
        await this.connection.query(
            'UPDATE products SET name = ?, barcode = ?, price = ?, category = ? WHERE id = ?',
            [product.name, product.barcode, product.price, product.category, id]
        );
    }

    async delete(id: number) {
        await this.connection.query('DELETE FROM products WHERE id = ?', [id]);
    }
}