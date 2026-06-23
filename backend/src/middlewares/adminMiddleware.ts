import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: number;
    role: string;
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction): any {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    // BARREIRA PARA O TOKEN: Resolve a linha vermelha do TypeScript
    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido ou ausente.' });
    }

    const secretKey = process.env.JWT_SECRET as string;

    if (!secretKey) {
        console.error("ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env");
        return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey) as unknown as TokenPayload;
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado: Requer privilégios de Administrador.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
}