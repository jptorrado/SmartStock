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
    // 2. Agora injetamos a nossa interface, não a do mysql2
    constructor(private db: IDatabase) {}

    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const users = rows as User[];
        return users[0] || null;
    }
}