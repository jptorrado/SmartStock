import { ProductRepository } from '../repositories/ProductRepository';

export class ProductService {
    constructor(private productRepository: ProductRepository) {}

    async listAll() {
        return await this.productRepository.findAll();
    }

    async registerProduct(data: { name: string; barcode: string; price: number; category_id: number }) {
        const duplicated = await this.productRepository.findByBarcode(data.barcode);
        if (duplicated) {
            throw new Error('Não é permitido cadastrar dois produtos com o mesmo código de barras.');
        }
        await this.productRepository.create(data);
    }

    async updateProduct(id: number, data: { name: string; barcode: string; price: number; category_id: number }) {
        const existingProduct = await this.productRepository.findByBarcode(data.barcode);
        // Se achou o código de barras, mas pertence a OUTRO produto, bloqueia a edição
        if (existingProduct && existingProduct.id !== id) {
            throw new Error('Este código de barras já está associado a outro produto do catálogo.');
        }
        await this.productRepository.update(id, data);
    }

    async removeProduct(id: number) {
        await this.productRepository.delete(id);
    }
}