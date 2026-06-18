import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
    constructor(private userService: UserService) {}

    async list(req: Request, res: Response) {
        try {
            const users = await this.userService.listUsers();
            return res.status(200).json(users);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;
            await this.userService.createUser(name, email, password, role);
            return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            await this.userService.resetPassword(Number(id), newPassword);
            return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.userService.deleteUser(Number(id));
            return res.status(200).json({ message: 'Usuário removido com sucesso.' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}