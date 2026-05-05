import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

import { UserRepository } from './repositories/UserRepository';
import { AuthService } from './services/AuthService';
import { AuthController } from './controllers/AuthController';

// Como o Docker já injetou as variáveis, não precisamos mais do dotenv.config() aqui.
const app = express();
app.use(express.json());
app.use(cors());

const startServer = async () => {
    try {
        console.log('⏳ Tentando conectar ao banco de dados...');

        const dbConfig = {
            host: process.env.DB_HOST as string,
            user: process.env.DB_USER as string,
            password: process.env.DB_PASS as string,
            database: process.env.DB_NAME as string,
        };

        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
            throw new Error('Variáveis de ambiente (DB_HOST, DB_USER, etc) não encontradas.');
        }

        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL conectado com sucesso.');

        const userRepository = new UserRepository(connection);
        const authService = new AuthService(userRepository);
        const authController = new AuthController(authService);

        app.post('/login', (req, res) => authController.login(req, res));

        const PORT = process.env.PORT || 3000;
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Erro fatal ao iniciar o servidor:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
};

startServer();