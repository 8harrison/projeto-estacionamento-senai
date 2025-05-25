import { Aluno } from "../models";
import { AlunoAttributes, AlunoCreationAttributes } from "../models/Aluno"; // Import interfaces if needed
import { FindOptions, WhereOptions } from "sequelize";

export class AlunoService {

  // Criar um novo aluno
  public async create(data: AlunoCreationAttributes): Promise<AlunoAttributes> {
    try {
      const aluno = await Aluno.create(data);
      // Retornar apenas os atributos definidos na interface AlunoAttributes
      return aluno.get({ plain: true });
    } catch (error: any) {
      console.error("Erro ao criar aluno:", error);
      // Verificar se é um erro de validação ou constraint
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Matrícula '${data.matricula}' já existe.`);
      }
      throw new Error("Erro no serviço ao criar aluno.");
    }
  }

  // Buscar todos os alunos (com opção de filtro)
  public async findAll(options?: FindOptions<AlunoAttributes>): Promise<AlunoAttributes[]> {
    try {
      const alunos = await Aluno.findAll(options);
      return alunos.map(aluno => aluno.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      throw new Error("Erro no serviço ao buscar alunos.");
    }
  }

  // Buscar um aluno por ID
  public async findById(id: number): Promise<AlunoAttributes | null> {
    try {
      const aluno = await Aluno.findByPk(id);
      return aluno ? aluno.get({ plain: true }) : null;
    } catch (error) {
      console.error(`Erro ao buscar aluno por ID ${id}:`, error);
      throw new Error("Erro no serviço ao buscar aluno por ID.");
    }
  }

  // Atualizar um aluno por ID
  public async update(id: number, data: Partial<AlunoAttributes>): Promise<AlunoAttributes | null> {
    try {
      const aluno = await Aluno.findByPk(id);
      if (!aluno) {
        return null; // Aluno não encontrado
      }
      // Remover campos não permitidos para atualização (ex: id, matricula talvez?)
      delete data.id;
      // delete data.matricula; // Descomente se matrícula não puder ser alterada

      await aluno.update(data);
      return aluno.get({ plain: true });
    } catch (error: any) {
      console.error(`Erro ao atualizar aluno por ID ${id}:`, error);
       if (error.name === 'SequelizeUniqueConstraintError') {
        // Assumindo que o erro de unicidade pode ser no email ou outra chave única
        throw new Error(`Erro: Já existe um registro com os dados fornecidos (ex: email).`);
      }
      throw new Error("Erro no serviço ao atualizar aluno.");
    }
  }

  // Deletar (ou marcar como inativo) um aluno por ID
  public async delete(id: number): Promise<boolean> {
    try {
      const aluno = await Aluno.findByPk(id);
      if (!aluno) {
        return false; // Aluno não encontrado
      }

      // Opção 1: Deletar permanentemente
      // await aluno.destroy();

      // Opção 2: Marcar como inativo (recomendado se houver FKs ou histórico)
      aluno.ativo = false;
      await aluno.save();

      return true;
    } catch (error) {
      console.error(`Erro ao deletar aluno por ID ${id}:`, error);
      throw new Error("Erro no serviço ao deletar aluno.");
    }
  }
}

