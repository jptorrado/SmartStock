import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { DatabaseManager } from './database/DatabaseManager';
import { UserRepository } from './repositories/UserRepository';
import { AuthService } from './services/AuthService';
import { AuthController } from './controllers/AuthController';

// Importações da US02 (CRUD de Produtos)
import { ProductRepository } from './repositories/ProductRepository';
import { ProductService } from './services/ProductService';
import { ProductController } from './controllers/ProductController';

// Importações da US03 (Entrada de Estoque)
import { StockRepository } from './repositories/StockRepository';
import { StockService } from './services/StockService';
import { StockController } from './controllers/StockController';

// Importação US06 (Gestão de Usuários)
import { authMiddleware } from './middlewares/authMiddleware';
import { adminMiddleware } from './middlewares/adminMiddleware';
import { UserService } from './services/UserService';
import { UserController } from './controllers/UserController';

// Importações US08: Categorias
import { categoryController } from './controllers/CategoryController';

const app = express();
app.use(express.json());
app.use(cors());

const startServer = async () => {
    try {
        // Validação preventiva das variáveis de ambiente antes de inicializar serviços
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
            throw new Error('Variáveis de ambiente de banco de dados ausentes.');
        }

        // US07: Invocação do Singleton para obter o Pool único gerenciado
        const dbPool = DatabaseManager.getInstance();
        console.log('✅ Banco de dados acoplado via Pool Singleton.');

        // Instanciando as esteiras de injeção de dependência passando o Pool unificado
        const userRepository = new UserRepository(dbPool);
        const authService = new AuthService(userRepository);
        const authController = new AuthController(authService);
        const userService = new UserService(userRepository);
        const userController = new UserController(userService);
        
        const productRepository = new ProductRepository();
        const productService = new ProductService(productRepository);
        const productController = new ProductController(productService);

        const stockRepository = new StockRepository();
        const stockService = new StockService(stockRepository);
        const stockController = new StockController(stockService);

        // Rota de Login
        app.post('/login', (req, res) => authController.login(req, res));
        
        // Rotas de Produtos (US02)
        app.get('/products', authMiddleware, (req, res) => productController.getAll(req, res));
        app.post('/products', authMiddleware, (req, res) => productController.create(req, res));
        app.put('/products/:id', authMiddleware, (req, res) => productController.update(req, res));
        app.delete('/products/:id', authMiddleware, (req, res) => productController.delete(req, res));

        // Rotas de Estoque (US03 e US04)
        app.post('/estoque/entrada', authMiddleware, (req, res) => stockController.entry(req, res));
        app.post('/estoque/saida', authMiddleware, (req, res) => stockController.output(req, res));
        app.get('/estoque/movimentacoes', authMiddleware, (req, res) => stockController.getMovements(req, res));

        // Rotas de Administração (US06)
        app.post('/users', adminMiddleware, (req, res) => userController.create(req, res));
        app.get('/users', adminMiddleware, (req, res) => userController.list(req, res));
        app.put('/users/:id', adminMiddleware, (req, res) => userController.update(req, res));
        app.delete('/users/:id', adminMiddleware, (req, res) => userController.delete(req, res));

        // Controle de Categorias (Protegidas pelo authMiddleware)
        app.get('/categories', authMiddleware, (req, res) => categoryController.getAll(req, res));
        app.post('/categories', authMiddleware, (req, res) => categoryController.create(req, res));
        app.put('/categories/:id', authMiddleware, (req, res) => categoryController.update(req, res));
        app.delete('/categories/:id', authMiddleware, (req, res) => categoryController.delete(req, res));

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