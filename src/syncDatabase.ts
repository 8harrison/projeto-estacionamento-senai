import { sequelize } from './models'; // Importa a instância configurada e os modelos

const syncDatabase = async () => {
  console.log('Iniciando sincronização com o banco de dados...');
  try {
    // O { force: true } recria as tabelas (CUIDADO: apaga dados existentes)
    // Use { alter: true } para tentar alterar tabelas existentes (mais seguro, mas pode falhar em casos complexos)
    // Remova force/alter para apenas criar tabelas se não existirem
    await sequelize.sync({ alter: true }); 
    console.log('Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  } finally {
    // Fecha a conexão após a sincronização
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

syncDatabase();
