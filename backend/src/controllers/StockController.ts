import { Request, Response } from 'express';
import { StockService } from '../services/StockService';

export class StockController {
    constructor(private stockService: StockService) {}

    async getProducts(req: Request, res: Response) {
        try {
            const products = await this.stockService.listProducts();
            return res.status(200).json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const result = await this.stockService.createProduct(req.body);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const result = await this.stockService.updateProduct(Number(req.params.id), req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const result = await this.stockService.deleteProduct(Number(req.params.id));
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async entry(req: Request, res: Response) {
        try {
            const { produtoId, quantidade } = req.body;
            const result = await this.stockService.addEntry(produtoId, quantidade);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    // --- MÉTODO NOVO DA US04 ---
    async output(req: Request, res: Response) {
        try {
            const { produtoId, quantidade } = req.body;
            const result = await this.stockService.removeEntry(Number(produtoId), Number(quantidade));
            return res.status(200).json(result);
        } catch (error: any) {
            // O status 400 devolve a mensagem exata ("Saldo insuficiente") para ser exibida na tela
            return res.status(400).json({ error: error.message });
        }
    }
    async getMovements(req: Request, res: Response) {
        try {
            const movements = await this.stockService.listMovements();
            return res.status(200).json(movements);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar histórico de movimentações.' });
        }
    }
}