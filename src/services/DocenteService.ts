import { Docente } from "../models";
import { DocenteAttributes, DocenteCreationAttributes } from "../models/Docente";
import { FindOptions } from "sequelize";

export class DocenteService {

  // Criar um novo docente
  public async create(data: DocenteCreationAttributes): Promise<DocenteAttributes> {
    try {
      const docente = await Docente.create(data);
      return docente.get({ plain: true });
    } catch (error: any) {
      console.error("Erro ao criar docente:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Matrícula '${data.matricula}' já existe.`);
      }
      throw new Error("Erro no serviço ao criar docente.");
    }
  }

  // Buscar todos os docentes
  public async findAll(options?: FindOptions<DocenteAttributes>): Promise<DocenteAttributes[]> {
    try {
      const docentes = await Docente.findAll(options);
      return docentes.map(docente => docente.get({ plain: true }));
    } catch (error) {
      console.error("Erro ao buscar docentes:", error);
      throw new Error("Erro no serviço ao buscar docentes.");
    }
  }

  // Buscar um docente por ID
  public async findById(id: number): Promise<DocenteAttributes | null> {
    try {
      const docente = await Docente.findByPk(id);
      return docente ? docente.get({ plain: true }) : null;
    } catch (error) {
      console.error(`Erro ao buscar docente por ID ${id}:`, error);
      throw new Error("Erro no serviço ao buscar docente por ID.");
    }
  }

  // Atualizar um docente por ID
  public async update(id: number, data: Partial<DocenteAttributes>): Promise<DocenteAttributes | null> {
    try {
      const docente = await Docente.findByPk(id);
      if (!docente) {
        return null;
      }
      delete data.id;
      // delete data.matricula; // Descomente se matrícula não puder ser alterada

      await docente.update(data);
      return docente.get({ plain: true });
    } catch (error: any) {
      console.error(`Erro ao atualizar docente por ID ${id}:`, error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Erro: Já existe um registro com os dados fornecidos (ex: email).`);
      }
      throw new Error("Erro no serviço ao atualizar docente.");
    }
  }

  // Deletar (marcar como inativo) um docente por ID
  public async delete(id: number): Promise<boolean> {
    try {
      const docente = await Docente.findByPk(id);
      if (!docente) {
        return false;
      }
      // Marcar como inativo
      docente.ativo = false;
      await docente.save();
      return true;
    } catch (error) {
      console.error(`Erro ao deletar docente por ID ${id}:`, error);
      throw new Error("Erro no serviço ao deletar docente.");
    }
  }
}

