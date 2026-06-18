import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async listUsers() {
        return await this.userRepository.findAll();
    }

    async createUser(name: string, email: string, passwordRaw: string, role: string) {
        if (!name || !email || !passwordRaw || !role) throw new Error('Dados incompletos.');
        
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) throw new Error('E-mail já cadastrado no sistema.');

        const passwordHash = await bcrypt.hash(passwordRaw, 10);
        return await this.userRepository.create(name, email, passwordHash, role);
    }

    async resetPassword(userId: number, newPasswordRaw: string) {
        if (!newPasswordRaw) throw new Error('A nova senha não pode ser vazia.');
        const passwordHash = await bcrypt.hash(newPasswordRaw, 10);
        await this.userRepository.updatePassword(userId, passwordHash);
    }

    async deleteUser(userId: number) {
        const userToBeDeleted = await this.userRepository.findById(userId);
        
        if (!userToBeDeleted) {
            throw new Error('Usuário não encontrado no sistema.');
        }

        if (userToBeDeleted.role === 'admin') {
            const adminCount = await this.userRepository.countAdmins();
            
            if (adminCount <= 1) {
                throw new Error('O sistema deve ter no mínimo um Administrador ativo.');
            }
        }

        await this.userRepository.delete(userId);
    }
}