import mysql, { Pool } from 'mysql2/promise';

export class DatabaseManager {
    // Propriedade estática privada que reterá o Pool único na memória do processo
    private static instance: Pool;

    // Construtor privado: impede estritamente o uso de "new DatabaseManager()" fora desta classe
    private constructor() {}

    /**
     * Recupera a instância única do Pool de conexões.
     * Se não existir, ela é criada de forma síncrona; se já existir, retorna o cache da memória.
     */
    public static getInstance(): Pool {
        if (!DatabaseManager.instance) {
            console.log('⚙️ Inicializando o Pool de Conexões MySQL (Singleton)...');
            
            DatabaseManager.instance = mysql.createPool({
                host: process.env.DB_HOST as string,
                user: process.env.DB_USER as string,
                password: process.env.DB_PASS as string,
                database: process.env.DB_NAME as string,
                waitForConnections: true,
                connectionLimit: 10, // Limite de conexões ativas reutilizáveis simultaneamente
                queueLimit: 0
            });
        }
        
        return DatabaseManager.instance;
    }
}