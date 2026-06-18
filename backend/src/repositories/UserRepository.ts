export interface User {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role?: string;
}
export interface IDatabase {
    execute(sql: string, values?: any): Promise<any>;
}

export class UserRepository {
    constructor(private db: IDatabase) {}

    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const users = rows as User[];
        return users[0] || null;
    }

    // --- MÉTODOS DA US06 (Gestão de Usuários) ---

    async findAll(): Promise<User[]> {
        // Não retornamos a senha por segurança
        const [rows] = await this.db.execute(
            'SELECT id, name, email, role FROM users'
        );
        return rows as User[];
    }

    async create(name: string, email: string, passwordHash: string, role: string): Promise<number> {
        const [result]: any = await this.db.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', // <-- Ajustado para password_hash
            [name, email, passwordHash, role]
        );
        return result.insertId;
    }

    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        await this.db.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?', // <-- Ajustado para password_hash
            [passwordHash, userId]
        );
    }
    
    async delete(userId: number): Promise<void> {
        await this.db.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
    }

    async findById(id: number): Promise<User | null> {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        const users = rows as User[];
        return users[0] || null;
    }

    async countAdmins(): Promise<number> {
        const [rows] = await this.db.execute(
            "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
        );
        return (rows as any)[0].count;
    }
}