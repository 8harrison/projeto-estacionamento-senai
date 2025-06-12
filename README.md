# 🚗 Sistema de Controle de Acesso ao Estacionamento - Backend

Este repositório contém o backend do sistema de controle de acesso ao estacionamento da unidade SENAI São José, desenvolvido para modernizar e otimizar a entrada e saída de veículos na instituição. O sistema é escalável e pode ser adaptado para outras unidades do SENAI.

---

## 📌 Contextualização

O estacionamento do SENAI São José enfrenta desafios como:
- Registro manual de acessos;
- Baixa segurança contra entradas não autorizadas;
- Falta de monitoramento em tempo real da lotação.

Este sistema busca resolver esses problemas por meio de um controle digital, permitindo:
- Redução de filas;
- Aumento da segurança;
- Melhor experiência para os usuários.

---

## ⚙️ Tecnologias Utilizadas

- **Node.js** + **Express** para desenvolvimento do backend;
- **PostgreSQL** como banco de dados relacional;
- **bcrypt** para criptografia de senhas;
- **JWT** para autenticação baseada em tokens;
- **dotenv** para variáveis de ambiente.

---

## ✅ Funcionalidades

### 1. Gestão de Usuários e Veículos
- Cadastro, edição e exclusão de usuários (alunos, professores e funcionários);
- Associação de veículos aos usuários.

### 2. Controle de Acesso
- Registro de entrada e saída de veículos;
- Validação de acesso com mensagens específicas em caso de:
  - Usuário não autorizado;
  - Estacionamento lotado.

### 3. Monitoramento e Relatórios
- Verificação de vagas disponíveis em tempo real;
- Painel administrativo com logs e relatórios de acessos.

---

## 🔐 Requisitos Não Funcionais

- **Segurança**:
  - Autenticação com JWT;
  - Senhas criptografadas com bcrypt.

- **Escalabilidade**:
  - Arquitetura modular para suportar múltiplas unidades.

- **Desempenho**:
  - Rotas otimizadas para resposta rápida.

---

## 🗃️ Estrutura do Banco de Dados

As principais tabelas do banco incluem:

- `usuarios`: armazena informações de alunos, professores e funcionários;
- `veiculos`: contém os veículos vinculados aos usuários;
- `registros_acesso`: salva logs de entrada e saída com data e hora.

> O diagrama de entidades está disponível na documentação técnica.

---

## 🚀 Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/8harrison/projeto-estacionamento-senai.git
cd projeto-estacionamento
