import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models/index'; // Import sequelize instance for connection check
import authRoutes from './routes/authRoutes';
import alunoRoutes from './routes/alunoRoutes';
import docenteRoutes from './routes/docenteRoutes';
import veiculoRoutes from './routes/veiculoRoutes';
import vagaRoutes from './routes/vagaRoutes';
import estacionamentoRoutes from './routes/estacionamentoRoutes';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express'; // Importar swagger-ui-express
import swaggerSpec from './config/swagger'; // Importar a especificação gerada
// import compression from 'compression';


dotenv.config();

const customCorsMiddleware = (req: express.Request, callback: any) => {
  const origin = req.header('Origin');
  const keyword = 'meu-site-sa-senai';

   // Lista de origens permitidas para desenvolvimento
  const devOrigins = [
    'http://localhost:3000',    // React development server
    'http://127.0.0.1:3000',   // Alternativa localhost
    'http://localhost:8080',    // Vue development server
    'http://localhost:4200'     // Angular development server
  ];

  // Verifica se é uma origem de desenvolvimento ou contém a palavra-chave
  const isAllowed = origin && (
    devOrigins.includes(origin) || 
    origin.includes(keyword)
  );
  
  // Verifica se a origem contém a palavra-chave
  const corsOptions = {
    origin: isAllowed ? origin : false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  };

  callback(null, corsOptions);
};

const app: Express = express();
const port = process.env.PORT || 3000;


// app.use(compression());
app.use(cors(customCorsMiddleware));
// Middlewares Globais
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulário URL-encoded

// Rota de Health Check básica
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API Estacionamento está operacional!' });
});

// Rota para a documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`);

// Integração das Rotas
app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/estacionamentos', estacionamentoRoutes);

// Middleware de Tratamento de Erros Genérico (deve ser o último middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Erro não tratado:", err.stack);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // 1. Testar conexão com o banco de dados
    console.log('Tentando conectar ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // 2. Sincronizar modelos (OPCIONAL - Apenas para desenvolvimento, use migrations em produção)
    // Comente ou remova esta linha se estiver usando migrations ou se a sincronização já foi feita
    // await sequelize.sync({ alter: true }); // CUIDADO: 'alter: true' pode causar perda de dados em alguns casos.
    // console.log('Modelos sincronizados com o banco de dados.');

    // 3. Iniciar o servidor Express
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`Acesse a API em http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1); // Encerrar o processo se a inicialização falhar
  }
};

// Iniciar o servidor
startServer();

