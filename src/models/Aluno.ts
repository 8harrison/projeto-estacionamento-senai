import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Veiculo from './Veiculo'; // Importar Veiculo para associação

// Interface para atributos do Aluno
export interface AlunoAttributes {
  id: number;
  matricula: string;
  nome: string;
  curso: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  data_cadastro: Date;
}

// Interface para atributos de criação (id, ativo, data_cadastro são opcionais)
export interface AlunoCreationAttributes extends Optional<AlunoAttributes, 'id' | 'ativo' | 'data_cadastro'> {}

class Aluno extends Model<AlunoAttributes, AlunoCreationAttributes> implements AlunoAttributes {
  public id!: number;
  public matricula!: string;
  public nome!: string;
  public curso!: string | null;
  public telefone!: string | null;
  public email!: string | null;
  public ativo!: boolean;
  public data_cadastro!: Date;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associação com Veiculo (Um Aluno pode ter muitos Veículos)
  public readonly veiculos?: Veiculo[];
}

Aluno.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'aluno_id', // Mapeia para o nome da coluna no SQL original
  },
  matricula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  curso: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  data_cadastro: {
    type: DataTypes.DATEONLY, // Apenas data, sem hora
    allowNull: false,
    defaultValue: DataTypes.NOW, // Define a data atual no momento da criação
  },
}, {
  sequelize,
  tableName: 'Alunos',
  timestamps: true, // Habilita createdAt e updatedAt
  underscored: true, // Usa snake_case para colunas geradas automaticamente (createdAt, updatedAt)
});

export default Aluno;

