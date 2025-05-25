import sequelize from '../config/database';
import Aluno from './Aluno';
import Docente from './Docente';
import Estacionamento from './Estacionamento';
import Usuario from './Usuario';
import Vaga from './Vaga';
import Veiculo from './Veiculo';

// --- Definir Associações --- 

// Aluno <-> Veiculo (Um Aluno tem Muitos Veículos)
Aluno.hasMany(Veiculo, {
  foreignKey: 'alunoId', // Chave estrangeira em Veiculo
  as: 'veiculos', // Alias para a associação
});
Veiculo.belongsTo(Aluno, {
  foreignKey: 'alunoId',
  as: 'aluno',
});

// Docente <-> Veiculo (Um Docente tem Muitos Veículos)
Docente.hasMany(Veiculo, {
  foreignKey: 'docenteId',
  as: 'veiculos',
});
Veiculo.belongsTo(Docente, {
  foreignKey: 'docenteId',
  as: 'docente',
});

// Veiculo <-> Estacionamento (Um Veículo tem Muitos Estacionamentos)
Veiculo.hasMany(Estacionamento, {
  foreignKey: 'veiculoId',
  as: 'estacionamentos',
});
Estacionamento.belongsTo(Veiculo, {
  foreignKey: 'veiculoId',
  as: 'veiculo',
});

// Vaga <-> Estacionamento (Uma Vaga tem Muitos Estacionamentos)
Vaga.hasMany(Estacionamento, {
  foreignKey: 'vagaId',
  as: 'estacionamentos',
});
Estacionamento.belongsTo(Vaga, {
  foreignKey: 'vagaId',
  as: 'vaga',
});

// Exportar todos os modelos e a instância do sequelize
export {
  sequelize,
  Aluno,
  Docente,
  Estacionamento,
  Usuario,
  Vaga,
  Veiculo,
};

