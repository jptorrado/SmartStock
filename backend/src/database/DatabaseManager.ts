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
            const isDocker = process.env.IS_DOCKER === 'true';
            const portaConexao = isDocker ? 3306 : Number(process.env.DB_PORT) || 3306;

            console.log(`⚙️ Inicializando o Pool de Conexões MySQL (Singleton) na porta ${isDocker ?'3306' :`${portaConexao}` }`);

            DatabaseManager.instance = mysql.createPool({
                host: process.env.DB_HOST as string,
                user: process.env.DB_USER as string,
                password: process.env.DB_PASS as string,
                port: portaConexao,
                database: process.env.DB_NAME as string,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
        }
        
        return DatabaseManager.instance;
    }
}