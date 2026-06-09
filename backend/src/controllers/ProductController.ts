import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
    constructor(private productService: ProductService) {}

    async getAll(req: Request, res: Response) {
        try {
            const products = await this.productService.listAll();
            return res.status(200).json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, barcode, price, category } = req.body;
            if (!name || !barcode || price === undefined || !category) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            await this.productService.registerProduct({ name, barcode, price: Number(price), category });
            return res.status(201).json({ message: 'Produto cadastrado com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, barcode, price, category } = req.body;
            await this.productService.updateProduct(Number(id), { name, barcode, price: Number(price), category });
            return res.status(200).json({ message: 'Produto atualizado com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.productService.removeProduct(Number(id));
            return res.status(200).json({ message: 'Produto removido com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}