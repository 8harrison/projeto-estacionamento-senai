import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Aluno from './Aluno'; // Importar Aluno para associação
import Docente from './Docente'; // Importar Docente para associação
import Estacionamento from './Estacionamento'; // Importar para associação

// Interface para atributos do Veiculo
export interface VeiculoAttributes {
  id: number;
  placa: string;
  modelo: string;
  cor: string | null;
  ano: number | null;
  alunoId: number | null; // Chave estrangeira para Aluno
  docenteId: number | null; // Chave estrangeira para Docente
}

// Interface para atributos de criação (id é opcional)
// alunoId e docenteId são opcionais aqui, mas a validação garantirá que um deles esteja presente
export interface VeiculoCreationAttributes extends Optional<VeiculoAttributes, 'id' | 'cor' | 'ano' | 'alunoId' | 'docenteId'> {
  // Permitir que alunoId ou docenteId sejam nulos na interface, mas a validação cuidará da regra
}

class Veiculo extends Model<VeiculoAttributes, VeiculoCreationAttributes> implements VeiculoAttributes {
  public id!: number;
  public placa!: string;
  public modelo!: string;
  public cor!: string | null;
  public ano!: number | null;
  public alunoId!: number | null;
  public docenteId!: number | null;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associações (definidas posteriormente no index.ts)
  public readonly aluno?: Aluno;
  public readonly docente?: Docente;
  public readonly estacionamentos?: Estacionamento[];
}

Veiculo.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'veiculo_id', // Mapeia para o nome da coluna no SQL original
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Alunos', // Referencia a tabela Alunos
      key: 'aluno_id',
    },
    onDelete: 'SET NULL',
    field: 'aluno_id', // Nome explícito da coluna FK
  },
  docenteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Docentes', // Referencia a tabela Docentes
      key: 'docente_id',
    },
    onDelete: 'SET NULL',
    field: 'docente_id', // Nome explícito da coluna FK
  },
}, {
  sequelize,
  tableName: 'Veiculos',
  timestamps: true,
  underscored: true,
  validate: {
    // Validação para garantir que o veículo pertença a um aluno OU um docente, mas não ambos ou nenhum
    checkProprietario() {
      if ((this.alunoId === null && this.docenteId === null) || (this.alunoId !== null && this.docenteId !== null)) {
        throw new Error('O veículo deve pertencer a um Aluno ou a um Docente, mas não a ambos ou nenhum.');
      }
    }
  }
});

export default Veiculo;

