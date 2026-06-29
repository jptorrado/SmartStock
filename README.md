# 📦 SmartStock - Sistema de Gestão de Estoque e Catálogo

O **SmartStock** é uma plataforma desenvolvida para o controle rigoroso de inventário, auditoria de movimentações e gestão de acessos. Projetado sob os pilares da escalabilidade e integridade relacional, o sistema oferece uma interface responsiva acoplada a uma API RESTful robusta.

## 🚀 Principais Funcionalidades
*   **Gestão de Catálogo:** Controle de produtos com validação de código de barras e precificação.
*   **Árvore de Categorias:** Sistema hierárquico (Pai/Filho) com cálculo recursivo e busca facetada inteligente.
*   **Controle de Estoque e Auditoria:** Registro imutável de entradas e saídas com rastreabilidade.
*   **Controle de Acesso (RBAC):** Níveis de permissão (Administrador e Operador) com rotas protegidas via JWT.

---

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter as ferramentas necessárias instaladas em seu ambiente.:

**Para execução via Docker (Recomendado):**
*   **Docker:** Engine rodando ativamente.
*   **Docker Compose** (Geralmente incluso no Docker Desktop).

**Para execução Local:**
*   **Node.js:** Versão 18 LTS ou superior.
*   **MySQL Server:** Versão 8.0+ instalada e rodando localmente.

---

## 🐳 Execução via Docker (Ambiente Recomendado)

A forma mais segura e isolada de executar a aplicação é através do Docker. 

### 1. Configuração do Arquivo `.env` na Raiz
Na pasta raiz do projeto (onde se encontra o arquivo `docker-compose.yml`), crie um arquivo chamado `.env`. Ele centralizará todas as variáveis de ambiente repassadas para os contêineres:

```env
DB_HOST=db
DB_USER=root
DB_PASS= # Insira aqui uma senha segura
DB_NAME=estoque_db
DB_PORT=3306
PORT=3000
FRONTEND_PORT=5173
JWT_SECRET= # Insira aqui um hash de 64 caracteres
```

### 2. Subindo a Aplicação
Abra o terminal na raiz do projeto e execute:

```bash
docker-compose up -d --build
```

---

## 💻 Execução do Ambiente Local

Para desenvolvimento direto na máquina, siga o fluxo abaixo para levantar cada camada individualmente.

### 1. Banco de Dados MySQL
É necessário possuir um servidor MySQL rodando localmente na porta 3306.
1. Crie o banco de dados.
2. Execute o conteúdo do arquivo `init.sql`, (localizado na raiz da pasta backend) no seu cliente MySQL para criar as tabelas e o administrador padrão.

### 2. Configuração e Inicialização do Back-end
Navegue até o diretório `backend` e crie o seu arquivo `.env` local com as seguintes variáveis:

```env
DB_HOST=localhost
DB_USER=  # Usuário do seu bd
DB_PASS= # Senha do seu bd
DB_NAME= # Nome escolhido na criação do bd
JWT_SECRET= # Insira aqui um hash de 64 caracteres
PORT=3000
DB_PORT=3306
```

Comandos para rodar:
```bash
cd backend
npm install
npm run dev
```

### 3. Configuração e Inicialização do Front-end
Navegue até o diretório `frontend` e crie o seu arquivo `.env` local com a seguinte variável:

```env
VITE_API_URL=http://localhost:3000 #Troque 3000 pela porta(PORT do backend) se mudar
FRONTEND_PORT=5173
```

Comandos para rodar:
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Padrão de Arquitetura: Singleton Pattern

O Back-end do SmartStock utiliza o padrão de projeto **Singleton** na camada de acesso a dados (`DatabaseManager`).

*   **O que é?** O Singleton garante que uma classe tenha apenas uma única instância em todo o ciclo de vida da aplicação.
*   **Implementação:** Em vez de instanciar múltiplas conexões e repassá-las manualmente, o `DatabaseManager` possui um construtor privado e um método estático `getInstance()`.
*   **Vantagens:** Previne o vazamento de memória (Connection Leaks), garante um único pool de conexões com o MySQL e desacopla a regra de negócio da infraestrutura, permitindo que repositórios foquem apenas em suas queries.

---

## 🧪 Testes Unitários e Integridade

Para garantir a confiabilidade do sistema e cumprir os requisitos de engenharia, a aplicação conta com uma suíte de **Testes Unitários com Jest** cobrindo os contratos principais da camada de serviço (`StockService`).

### Estratégia de Teste (Mocking)
Os testes operam com isolamento total do banco de dados utilizando a técnica de *Mocking*. Emulamos o `StockRepository` para validar exclusivamente a lógica de negócio estruturada no padrão **AAA** (Arrange, Act, Assert).

### Contratos Críticos Validados:
1.  **Proteção de Entrada:** Bloqueio e lançamento de exceção contra tentativas de injetar "estoque negativo" ou zero.
2.  **Proteção de Saída (Saldo):** Validação estrita do saldo em banco antes de qualquer dedução, garantindo que o estoque jamais fique negativo.

### Como executar
Abra o terminal, navegue até a pasta do back-end e execute o comando de testes:

```bash
cd backend
npm run test
```

O Jest varrerá o sistema, validando a matemática e as travas de segurança do `StockService`, retornando o relatório de aprovação no console.