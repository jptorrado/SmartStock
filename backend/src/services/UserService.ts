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

    async deleteUser(userId: number) {
        const userToBeDeleted = await this.userRepository.findById(userId);
        
        if (!userToBeDeleted) {
            throw new Error('Usuário não encontrado no sistema.');
        }

        if (userToBeDeleted.role === 'admin') {
            const adminCount = await this.userRepository.countAdmins();
            
            if (adminCount <= 1) {
                throw new Error('O sistema deve ter no mínimoum Administrador ativo.');
            }
        }

        // 3. Se passou pela barreira, a execução é autorizada
        await this.userRepository.delete(userId);
    }

    async updateUser(id: number, name: string, email: string, role: string, passwordRaw?: string) {
        if (!name || !email || !role) throw new Error('Dados incompletos.');

        const user = await this.userRepository.findById(id);
        if (!user) throw new Error('Usuário não encontrado.');

        // Evita que o usuário roube o e-mail de outro operador
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== id) {
            throw new Error('Este e-mail já está em uso por outro usuário.');
        }

        // BARREIRA ANTI-LOCKOUT: Se estiver tentando rebaixar um admin para operador
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await this.userRepository.countAdmins();
            if (adminCount <= 1) {
                throw new Error('Operação bloqueada: O sistema não pode ficar sem um Administrador ativo.');
            }
        }

        let passwordHash;
        if (passwordRaw) {
            passwordHash = await bcrypt.hash(passwordRaw, 10);
        }

        await this.userRepository.update(id, name, email, role, passwordHash);
    }

}