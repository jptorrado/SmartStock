import { DatabaseManager } from '../database/DatabaseManager';

export class CategoryService {
    private db = DatabaseManager.getInstance();

    async create(data: { name: string; description?: string; parent_id?: number }) {
        // Critério 3: Não deve ser permitido cadastrar duas categorias com o mesmo Nome no mesmo nível
        let queryCheck = 'SELECT id FROM categories WHERE name = ? ';
        const paramsCheck: any[] = [data.name];

        if (data.parent_id) {
            queryCheck += 'AND parent_id = ?';
            paramsCheck.push(data.parent_id);
        } else {
            queryCheck += 'AND parent_id IS NULL';
        }

        const [existing]: any = await this.db.execute(queryCheck, paramsCheck);
        if (existing.length > 0) {
            throw new Error('Já existe uma categoria com este nome neste nível hierárquico.');
        }

        // Critério 2: Vinculação de Categoria Pai (A chave estrangeira no banco garante a integridade)
        const [result]: any = await this.db.execute(
            'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)',
            [data.name, data.description || null, data.parent_id || null]
        );
        return { id: result.insertId, ...data, status: 'active' };
    }

    async update(id: number, data: { name: string; description?: string; parent_id?: number; status?: 'active' | 'inactive' }) {
        // Verifica duplicação de nome na edição (ignorando a própria categoria)
        let queryCheck = 'SELECT id FROM categories WHERE name = ? AND id != ? ';
        const paramsCheck: any[] = [data.name, id];

        if (data.parent_id) {
            queryCheck += 'AND parent_id = ?';
            paramsCheck.push(data.parent_id);
        } else {
            queryCheck += 'AND parent_id IS NULL';
        }

        const [existing]: any = await this.db.execute(queryCheck, paramsCheck);
        if (existing.length > 0) {
            throw new Error('Já existe outra categoria com este nome neste nível hierárquico.');
        }

        // Critério 5: Alterar status para inativo (Soft Delete/Ocultação)
        await this.db.execute(
            'UPDATE categories SET name = ?, description = ?, parent_id = ?, status = ? WHERE id = ?',
            [data.name, data.description || null, data.parent_id || null, data.status || 'active', id]
        );
        return { id, ...data };
    }

    async delete(id: number) {
        // Critério 4: Bloqueio de exclusão se possuir produtos vinculados
        const [products]: any = await this.db.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
        if (products[0].count > 0) {
            throw new Error('Operação bloqueada: Esta categoria possui produtos vinculados. Altere o status para "Inativo" em vez de excluí-la.');
        }

        // Segurança extra: Bloqueio se possuir subcategorias vinculadas
        const [subcategories]: any = await this.db.execute('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [id]);
        if (subcategories[0].count > 0) {
            throw new Error('Operação bloqueada: Esta categoria possui subcategorias. Remova ou mova as subcategorias primeiro.');
        }

        await this.db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return { message: 'Categoria excluída com sucesso.' };
    }

    async getAll() {
        const [rows] = await this.db.execute(`
            SELECT c1.*, c2.name as parent_name 
            FROM categories c1 
            LEFT JOIN categories c2 ON c1.parent_id = c2.id 
            ORDER BY c1.parent_id ASC, c1.name ASC
        `);
        return rows;
    }
}