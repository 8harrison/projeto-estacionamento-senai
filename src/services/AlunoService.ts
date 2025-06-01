import { Aluno, Veiculo } from "../models"; // Importar Veiculo
import { AlunoAttributes, AlunoCreationAttributes } from "../models/Aluno";
import { FindOptions, WhereOptions } from "sequelize";

export class AlunoService {

  // Criar um novo aluno
  public async create(data: AlunoCreationAttributes): Promise<AlunoAttributes> {
    try {
      const aluno = await Aluno.create(data);
      return aluno.get({ plain: true });
    } catch (error: any) {
      console.error("Erro ao criar aluno:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Matrícula '${data.matricula}' já existe.`);
      }
      throw new Error("Erro no serviço ao criar aluno.");
    }
  }

  // Buscar todos os alunos (incluindo veículos associados)
  public async findAll(options?: FindOptions<AlunoAttributes>): Promise<AlunoAttributes[]> {
    try {
      const finalOptions = {
        ...options,
        include: [{ model: Veiculo, as: 'veiculos' }] // Incluir veículos
      };
      const alunos = await Aluno.findAll(finalOptions);
      return alunos.map(aluno => aluno.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      throw new Error("Erro no serviço ao buscar alunos.");
    }
  }

  // Buscar um aluno por ID (incluindo veículos associados)
  public async findById(id: number): Promise<AlunoAttributes | null> {
    try {
      const aluno = await Aluno.findByPk(id, {
        include: [{ model: Veiculo, as: 'veiculos' }] // Incluir veículos
      });
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
        return null;
      }
      delete data.id;
      // delete data.matricula; // Descomente se matrícula não puder ser alterada

      await aluno.update(data);
      // Recarregar para incluir veículos após atualização?
      // Ou retornar apenas os dados atualizados do aluno?
      // Por simplicidade, retornamos o aluno atualizado sem recarregar veículos aqui.
      // Se precisar dos veículos atualizados, use findById após o update.
      return aluno.get({ plain: true }); 
    } catch (error: any) {
      console.error(`Erro ao atualizar aluno por ID ${id}:`, error);
       if (error.name === 'SequelizeUniqueConstraintError') {
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
        return false;
      }
      // Verificar se há veículos associados ativos? Ou se há registro de estacionamento ativo?
      // Por enquanto, apenas inativa o aluno.
      aluno.ativo = false;
      await aluno.save();
      return true;
    } catch (error) {
      console.error(`Erro ao deletar aluno por ID ${id}:`, error);
      // Adicionar tratamento para FK constraint se houver veículos ativos ou estacionamento?
      throw new Error("Erro no serviço ao deletar aluno.");
    }
  }
}

