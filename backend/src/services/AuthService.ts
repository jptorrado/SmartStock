import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async executeLogin(email: string, passwordPlain: string) {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('E-mail ou senha inválidos.'); 
        }

        const isPasswordValid = await bcrypt.compare(passwordPlain, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('E-mail ou senha inválidos.');
        }
        
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error('JWT_SECRET não configurado.');
        }

        // Injetando o 'role' dentro do Token para o Middleware de Ferro conseguir ler
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        };
    }
}