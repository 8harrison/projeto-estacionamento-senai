import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  console.error('Erro: Variável de ambiente DB_URL não definida.');
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false, // Defina como true para ver os logs SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necessário para algumas conexões Supabase/Heroku
    }
  }
});

export default sequelize;

