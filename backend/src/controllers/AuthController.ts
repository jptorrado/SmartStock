import { Request, Response } from 'express';
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

            // Por enquanto, retornamos os dados do utilizador. 
            // Na próxima Sprint, geraremos o Token JWT aqui.
            return res.status(200).json({
                message: 'Login realizado com sucesso',
                user
            });
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }
}