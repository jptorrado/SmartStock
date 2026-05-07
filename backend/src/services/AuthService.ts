import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
    // Recebemos o funcionário (Repository) que sabe falar com o banco
    constructor(private userRepository: UserRepository) {}

    async executeLogin(email: string, passwordPlain: string) {
        // 1. Busca o usuário pelo e-mail
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('E-mail ou senha inválidos.'); // Segurança: não diga qual dos dois errou
        }

        // 2. Compara a senha digitada com o hash que salvamos no init.sql
        const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('E-mail ou senha inválidos.');
        }
        
        // Gera o Token JWT (Vale por 1 dia)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '1d' }
        );
        // 3. Se chegou aqui, o login é válido!
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        };
    }
}