CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo o primeiro Admin (Senha: admin123)
-- Nota: Em produção, o hash seria gerado pelo Bcrypt. 
-- Para este teste inicial, usaremos um hash de exemplo.
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Administrador', 'admin@supermercado.com', '$2a$10$hgcTSHjGpxEPg6WNb0U7ouHR5J5YYR5l1XVAejdK8JsG9w2Bko00a', 'admin');