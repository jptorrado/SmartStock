import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';

export class AuthController {
    constructor(private authService: AuthService) {}

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Validação básica de entrada
            if (!email || !password) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }

            const user = await this.authService.executeLogin(email, password);

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                return res.status(500).json({ error: 'JWT_SECRET não configurado no servidor.' });
            }

            const token = jwt.sign(
                { sub: user.id, email: user.email, role: user.role },
                secret,
                { expiresIn: '8h' }
            );

            return res.status(200).json({
                message: 'Login realizado com sucesso',
                token,
                user,
            });
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }
}
