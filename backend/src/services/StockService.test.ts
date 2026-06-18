import { StockService } from './StockService';
import { StockRepository } from '../repositories/StockRepository';

// 1. Mockamos (simulamos) o Repositório para não precisarmos de um Banco de Dados real
jest.mock('../repositories/StockRepository');

describe('Suíte de Testes Unitários: StockService (Contratos Principais)', () => {
    let stockService: StockService;
    let mockStockRepository: jest.Mocked<StockRepository>;

    beforeEach(() => {
        // Limpamos as simulações antes de cada teste
        jest.clearAllMocks();

        // 2. ARRANGE (Preparar): Instanciamos o mock com as funções "vazias"
        mockStockRepository = {
            getStock: jest.fn(),
            registerOutput: jest.fn(),
            registerEntry: jest.fn(),
            getAllProducts: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
            getMovements: jest.fn()
        } as unknown as jest.Mocked<StockRepository>;

        // Injetamos o repositório falso no serviço real
        stockService = new StockService(mockStockRepository);
    });

    // =========================================================================
    // TESTE 1: Validação do Contrato de Entrada (Quantidade Inválida)
    // =========================================================================
    it('Deve lançar um erro e abortar a operação se a quantidade de entrada for 0 ou negativa', async () => {
        // ARRANGE
        const produtoIdValido = 1;
        const quantidadeInvalida = -5;

        // ACT (Agir) & ASSERT (Validar)
        // Esperamos que, ao tentar adicionar estoque negativo, a Promessa seja rejeitada com o erro exato.
        await expect(stockService.addEntry(produtoIdValido, quantidadeInvalida))
            .rejects
            .toThrow('Produto inválido ou a quantidade recebida deve ser maior que zero.');

        // Validamos que a função do banco de dados NUNCA foi chamada, protegendo a integridade.
        expect(mockStockRepository.registerEntry).not.toHaveBeenCalled();
    });

    // =========================================================================
    // TESTE 2: Validação do Contrato de Saída (Regra Crítica de Saldo)
    // =========================================================================
    it('Deve bloquear a baixa de estoque se a quantidade solicitada for maior que o saldo atual', async () => {
        // ARRANGE
        const produtoIdValido = 1;
        const quantidadeParaBaixa = 10;
        
        // Simulamos que o banco de dados tem apenas 5 unidades de saldo
        mockStockRepository.getStock.mockResolvedValue(5);

        // ACT & ASSERT
        await expect(stockService.removeEntry(produtoIdValido, quantidadeParaBaixa))
            .rejects
            .toThrow('Saldo insuficiente para realizar esta baixa. Estoque atual: 5');

        // Validamos que o sistema consultou o saldo real antes de tomar a decisão
        expect(mockStockRepository.getStock).toHaveBeenCalledWith(produtoIdValido);
        
        // Validamos que o débito NUNCA ocorreu, evitando que o estoque fique negativo
        expect(mockStockRepository.registerOutput).not.toHaveBeenCalled();
    });
});