import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

const categoryService = new CategoryService();

export const categoryController = {
    async create(req: Request, res: Response) {
        try {
            const category = await categoryService.create(req.body);
            return res.status(201).json(category);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const category = await categoryService.update(Number(req.params.id), req.body);
            return res.json(category);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            const result = await categoryService.delete(Number(req.params.id));
            return res.json(result);
        } catch (error: any) {
            // O HTTP 409 Conflict é o status correto quando violamos integridade referencial
            return res.status(409).json({ error: error.message });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAll();
            return res.json(categories);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar categorias' });
        }
    }
};