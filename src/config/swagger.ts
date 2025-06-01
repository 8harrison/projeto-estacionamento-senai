import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Estacionamento',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de gerenciamento de estacionamento universitário.',
      contact: {
        name: 'Manus AI Agent',
        // url: 'http://example.com', // Opcional
        // email: 'info@example.com', // Opcional
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desenvolvimento Local',
      },
      {
        url: "https://projeto-estacionamento-senai.onrender.com/api",
        description: 'Servidor de Deploy'
      }
      // Adicionar outros servidores se necessário (ex: produção)
    ],
    // Definir componentes globais (ex: esquemas de segurança)
    components: {
      securitySchemes: {
        bearerAuth: { // Nome do esquema de segurança
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Formato do token
        },
      },
      // Adicionar Schemas reutilizáveis aqui se desejar
      // schemas: {
      //   ErrorResponse: {
      //     type: 'object',
      //     properties: {
      //       message: {
      //         type: 'string',
      //         description: 'Mensagem de erro.'
      //       }
      //     }
      //   }
      // }
    },
    // Definir segurança global (aplicada a todas as rotas que não especificam outra)
    security: [
      {
        bearerAuth: [], // Aplica o esquema bearerAuth globalmente
      },
    ],
  },
  // Caminho para os arquivos que contêm as anotações JSDoc para as rotas da API
  apis: ['./src/routes/*.ts'], // Ajuste o padrão conforme necessário
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

