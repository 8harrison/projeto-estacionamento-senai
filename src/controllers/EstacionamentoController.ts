import { Request, Response } from 'express';
import { EstacionamentoService } from '../services/EstacionamentoService';

const estacionamentoService = new EstacionamentoService();

export class EstacionamentoController {

  // Registrar entrada de veículo
  public async registrarEntrada(req: Request, res: Response) {
    try {
      const { veiculoId, vagaId } = req.body;
      if (!veiculoId || !vagaId) {
        res.status(400).json({ message: 'veiculoId e vagaId são obrigatórios.' });
        return
      }
      // Validar se são números
      if (isNaN(parseInt(veiculoId, 10)) || isNaN(parseInt(vagaId, 10))) {
        res.status(400).json({ message: 'veiculoId e vagaId devem ser números inteiros.' });
        return
      }

      const novoEstacionamento = await estacionamentoService.registrarEntrada({ veiculoId: parseInt(veiculoId, 10), vagaId: parseInt(vagaId, 10) });
      req.io.emit('resultado-novo-estacionamento', novoEstacionamento)
      res.status(201).json(novoEstacionamento);
      return
    } catch (error: any) {
      console.error('Erro no controller ao registrar entrada:', error.message);
      // Retornar erros específicos do service
      if (error.message.includes('não encontrado') || error.message.includes('já está ocupada') || error.message.includes('já possui um registro de entrada ativo')) {
        res.status(400).json({ message: error.message }); // Bad Request or Conflict (409?)
        return
      }
      res.status(500).json({ message: 'Erro interno ao registrar entrada.' });
      return
    }
  }

  // Registrar saída de veículo
  public async registrarSaida(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID do estacionamento inválido.' });
        return
      }
      const { valorPago } = req.body; // valorPago é opcional
      let valorPagoNum: number | undefined = undefined;
      if (valorPago !== undefined) {
        valorPagoNum = parseFloat(valorPago);
        if (isNaN(valorPagoNum)) {
          res.status(400).json({ message: 'valorPago deve ser um número válido.' });
          return
        }
      }

      const estacionamentoAtualizado = await estacionamentoService.registrarSaida(id, valorPagoNum);
      if (!estacionamentoAtualizado) {
        // O service já trata os casos de 'não encontrado' ou 'saída já registrada' lançando erro
        // Este caso não deveria ocorrer se o service lançar erro corretamente.
        res.status(404).json({ message: 'Registro de estacionamento ativo não encontrado para registrar saída.' });
        return
      }
      res.status(200).json(estacionamentoAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao registrar saída:', error.message);
      if (error.message.includes('não encontrado') || error.message.includes('já foi registrada')) {
        res.status(404).json({ message: error.message }); // Not Found or Conflict (409?)
        return
      }
      res.status(500).json({ message: 'Erro interno ao registrar saída.' });
      return
    }
  }

  // Listar todos os registros de estacionamento (com filtros)
  public async findAll(req: Request, res: Response) {
    try {
      // Adicionar lógica para filtros (por data, veículo, vaga) via req.query
      // Ex: /estacionamentos?veiculoId=1&dataInicio=2024-01-01&dataFim=2024-01-31
      const filterOptions: any = {}; // Construir objeto de filtro baseado em req.query
      // ... lógica para adicionar filtros ...

      const options = Object.keys(filterOptions).length > 0 ? { where: filterOptions } : undefined;
      const estacionamentos = await estacionamentoService.findAll(options);
      res.status(200).json(estacionamentos);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar registros de estacionamento:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar registros de estacionamento.' });
      return
    }
  }

  // Listar registros de estacionamento ativos
  public async findActive(req: Request, res: Response) {
    try {
      const estacionamentosAtivos = await estacionamentoService.findActive();
      res.status(200).json(estacionamentosAtivos);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar estacionamentos ativos:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar estacionamentos ativos.' });
      return
    }
  }

  // Buscar registro de estacionamento por ID
  public async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const estacionamento = await estacionamentoService.findById(id);
      if (!estacionamento) {
        res.status(404).json({ message: 'Registro de estacionamento não encontrado.' });
        return
      }
      res.status(200).json(estacionamento);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar estacionamento por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar estacionamento por ID.' });
      return
    }
  }
}

