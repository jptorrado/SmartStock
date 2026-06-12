import { StockRepository } from '../repositories/StockRepository';

export class StockService {
    constructor(private stockRepository: StockRepository) {}

    async listProducts() {
        return await this.stockRepository.getAllProducts();
    }

    async createProduct(data: any) {
        if (!data.name || !data.barcode || !data.price || !data.category) {
            throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
        }
        await this.stockRepository.createProduct(data.name, data.barcode, data.price, data.category);
        return { message: 'Produto cadastrado com sucesso.' };
    }

    async updateProduct(id: number, data: any) {
        if (!id) throw new Error('ID do produto não informado.');
        await this.stockRepository.updateProduct(id, data.name, data.barcode, data.price, data.category);
        return { message: 'Produto atualizado com sucesso.' };
    }

    async deleteProduct(id: number) {
        if (!id) throw new Error('ID do produto não informado.');
        await this.stockRepository.deleteProduct(id);
        return { message: 'Produto removido com sucesso.' };
    }

    async addEntry(produtoId: number, quantidade: number) {
        if (!produtoId || quantidade <= 0) {
            throw new Error('Produto inválido ou a quantidade recebida deve ser maior que zero.');
        }
        await this.stockRepository.registerEntry(produtoId, quantidade);
        return { message: 'Entrada registrada com sucesso e saldo atualizado.' };
    }
}