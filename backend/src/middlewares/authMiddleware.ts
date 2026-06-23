import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseManager } from '../database/DatabaseManager';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Credencial não fornecida.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token malformado.' });
    }

    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({ error: 'Erro de infraestrutura: JWT_SECRET ausente.' });
        }

        const decoded = jwt.verify(token, secret as string) as any;

        const db = DatabaseManager.getInstance();
        const [rows]: any = await db.execute('SELECT id, role FROM users WHERE id = ?', [decoded.id]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Acesso revogado. Sua credencial foi invalidada pelo administrador.' });
        }

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
};