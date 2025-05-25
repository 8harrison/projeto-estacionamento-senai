# Guia Passo a Passo: Projeto Estacionamento (Node.js + TypeScript + Sequelize + Supabase)

Este guia detalha os passos necessários para configurar e executar o projeto de gerenciamento de estacionamento em seu ambiente de desenvolvimento (como o GitHub Codespaces, por exemplo, para contornar restrições locais).

## 1. Pré-requisitos

*   **Conta no Supabase:** Você precisará de uma conta gratuita no [Supabase](https://supabase.com/) para criar seu banco de dados PostgreSQL.
*   **Node.js e npm:** Seu ambiente de desenvolvimento precisa ter o Node.js (versão 16 ou superior recomendada) e o npm instalados. Ambientes como GitHub Codespaces já vêm com eles pré-instalados.
*   **Git (Opcional):** Se você for clonar este projeto de um repositório Git.

## 2. Configuração do Banco de Dados no Supabase

1.  **Crie um Projeto:** Faça login no Supabase e crie um novo projeto. Escolha uma região próxima a você.
2.  **Obtenha a URL de Conexão:**
    *   No painel do seu projeto Supabase, vá para **Project Settings** (ícone de engrenagem na barra lateral esquerda).
    *   Selecione **Database**.
    *   Em **Connection string**, copie a URL que começa com `postgres://postgres:[YOUR-PASSWORD]@...`. **Importante:** Certifique-se de substituir `[YOUR-PASSWORD]` pela senha que você definiu ao criar o projeto no Supabase.

## 3. Configuração do Projeto Localmente (no seu Ambiente de Desenvolvimento)

1.  **Obtenha o Código:**
    *   Se você recebeu os arquivos como um anexo `.zip`, descompacte-os em uma pasta no seu ambiente.
    *   Se o projeto estiver em um repositório Git, clone-o:
        ```bash
        git clone <url_do_repositorio>
        cd <nome_da_pasta_do_projeto>
        ```
    *   Caso contrário, crie a estrutura de pastas e os arquivos conforme fornecido.

2.  **Navegue até a Pasta do Projeto:**
    ```bash
    cd /caminho/para/projeto-estacionamento
    ```

3.  **Instale as Dependências:** Execute o comando a seguir no terminal, dentro da pasta do projeto, para instalar todos os pacotes necessários definidos no `package.json`:
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    *   Renomeie o arquivo `.env.example` para `.env`:
        ```bash
        mv .env.example .env
        ```
    *   Abra o arquivo `.env` com um editor de texto.
    *   Cole a **URL de Conexão do Supabase** (obtida na Etapa 2.2) no valor da variável `DB_URL`.
        *Exemplo:* `DB_URL=\'postgres://postgres:suaSenhaSuperSecreta@db.abcdefghijklmnop.supabase.co:5432/postgres\'`
    *   Defina um valor seguro e aleatório para `JWT_SECRET`. Este segredo é usado para assinar os tokens de autenticação.
        *Exemplo:* `JWT_SECRET=\'umSegredoMuitoLongoComplexoEDificilDeAdivinhar12345\'`
    *   Você pode manter a `PORT` como `3000` ou alterá-la se necessário.
    *   Salve o arquivo `.env`.

## 4. Sincronização do Banco de Dados

O Sequelize pode sincronizar os modelos definidos no código com o banco de dados, criando as tabelas automaticamente. **Atenção:** Em um ambiente de produção real, é mais recomendado usar migrações (Sequelize migrations) para gerenciar alterações no esquema do banco de dados de forma controlada. Para este projeto inicial, usaremos a sincronização direta.

1.  **Crie um Script de Sincronização:** Adicione o seguinte script ao seu `package.json` dentro da seção `"scripts"`:
    ```json
    "sync:db": "npx ts-node ./src/syncDatabase.ts"
    ```
    *Seu `package.json` ficará parecido com isso (mantenha os outros scripts existentes):*
    ```json
    {
      "name": "projeto-estacionamento",
      "version": "1.0.0",
      "main": "dist/server.js", // Ajuste se necessário
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "build": "npx tsc",
        "start": "node dist/server.js", // Exemplo de script start
        "dev": "npx ts-node-dev --respawn --transpile-only src/server.ts", // Exemplo de script dev
        "sync:db": "npx ts-node ./src/syncDatabase.ts" // Script adicionado
      },
      // ... resto do package.json
    }
    ```

2.  **Crie o Arquivo `src/syncDatabase.ts`:** Crie um novo arquivo chamado `syncDatabase.ts` dentro da pasta `src` com o seguinte conteúdo:
    ```typescript
    import { sequelize } from \'./models\'; // Importa a instância configurada e os modelos
    
    const syncDatabase = async () => {
      console.log(\'Iniciando sincronização com o banco de dados...\');
      try {
        // O { force: true } recria as tabelas (CUIDADO: apaga dados existentes)
        // Use { alter: true } para tentar alterar tabelas existentes (mais seguro, mas pode falhar em casos complexos)
        // Remova force/alter para apenas criar tabelas se não existirem
        await sequelize.sync({ alter: true }); 
        console.log(\'Banco de dados sincronizado com sucesso!\');
      } catch (error) {
        console.error(\'Erro ao sincronizar o banco de dados:\', error);
      } finally {
        // Fecha a conexão após a sincronização
        await sequelize.close();
        console.log(\'Conexão com o banco de dados fechada.\');
      }
    };
    
    syncDatabase();
    ```
    *Observação sobre `sequelize.sync()`:*
    *   `{ force: true }`: Apaga as tabelas existentes e as recria. **Use com extremo cuidado, pois todos os dados serão perdidos.** Útil durante o desenvolvimento inicial.
    *   `{ alter: true }`: Tenta alterar as tabelas existentes para corresponder aos modelos. É mais seguro que `force: true`, mas pode não funcionar para todas as alterações complexas de esquema.
    *   Sem opções (`sequelize.sync()`): Cria as tabelas apenas se elas não existirem. Não altera tabelas existentes.
    *   Para este guia, usamos `{ alter: true }` como um meio-termo para desenvolvimento.

3.  **Instale o `ts-node` (se ainda não estiver instalado globalmente ou como dependência de desenvolvimento):**
    ```bash
    npm install ts-node --save-dev 
    ```

4.  **Execute a Sincronização:** Rode o script no terminal:
    ```bash
    npm run sync:db
    ```
    Aguarde a mensagem "Banco de dados sincronizado com sucesso!". Verifique o painel do Supabase (na seção "Table Editor") para confirmar que as tabelas (`Usuarios`, `Alunos`, `Docentes`, `Vagas`, `Veiculos`, `Estacionamentos`) foram criadas.

## 5. Próximos Passos (Desenvolvimento da API)

Neste ponto, você tem a estrutura do banco de dados configurada e sincronizada com base nos modelos Sequelize.

O próximo passo lógico seria desenvolver a camada de API (usando Express, por exemplo) para permitir interações com o banco de dados:

1.  **Criar Rotas:** Definir os endpoints da API (ex: `/api/alunos`, `/api/vagas`, `/api/auth/login`) no diretório `src/routes`.
2.  **Criar Controladores:** Implementar a lógica para cada rota no diretório `src/controllers`. Os controladores usariam os modelos Sequelize (`Aluno`, `Vaga`, etc.) para interagir com o banco de dados (criar, ler, atualizar, deletar - CRUD).
3.  **Implementar Autenticação/Autorização:** Criar endpoints para login (`/api/auth/login`) que gerem tokens JWT e middleware (`src/middleware`) para proteger rotas, verificando o token e o `role` do usuário (`porteiro` ou `administrador`).
4.  **Criar Serviços (Opcional):** Para lógicas de negócio mais complexas, você pode adicionar uma camada de serviço (`src/services`) entre os controladores e os modelos.
5.  **Configurar o Servidor:** Criar o arquivo principal do servidor (ex: `src/server.ts`) para inicializar o Express, configurar middlewares (como o de autenticação) e conectar as rotas.
6.  **Adicionar Scripts de Execução:** Atualizar os scripts `start` e `dev` no `package.json` para iniciar o servidor da API.

## 6. Considerações sobre Herança (Aluno/Docente)

Conforme solicitado, `Aluno` e `Docente` possuem propriedades em comum (`matricula`, `nome`, `telefone`, `email`, `ativo`, `data_cadastro`). No modelo SQL original e na implementação Sequelize atual, eles são representados como tabelas separadas. Embora o TypeScript permita criar classes base abstratas ou interfaces para compartilhar a *definição* dessas propriedades no código, o Sequelize mapeia cada modelo para uma tabela específica.

A abordagem atual com modelos `Aluno` e `Docente` separados reflete diretamente a estrutura do banco de dados fornecida e é uma prática comum com ORMs como o Sequelize. Manter tabelas separadas é geralmente mais simples para consultas e gerenciamento de dados quando as entidades têm atributos distintos (como `curso` para Aluno e `departamento` para Docente) e relacionamentos potencialmente diferentes no futuro.

Se uma única tabela fosse estritamente necessária (usando uma coluna `tipo_pessoa`), a modelagem no Sequelize e as consultas se tornariam mais complexas.

Este guia fornece a base de dados e modelos. A construção da API sobre essa base é o próximo passo natural.
