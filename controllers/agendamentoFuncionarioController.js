const AgendamentoModel = require("../models/agendamentoModel.js");
const UsuarioModel = require("../models/usuarioModel.js"); 
const ServicoModel = require("../models/servicoModel.js"); 

const AgendamentoFuncionarioController = {
  async listar(req, res) {
    try {
      const { id_funcionario } = req.query;
      let agendamentos;

      if (id_funcionario) {
        agendamentos = await AgendamentoModel.findAll({
            where: { id_funcionario },
            include: [
                { 
                    model: UsuarioModel, 
                    as: 'cliente',       // Alias configurado para o cliente
                    attributes: ['nome'] 
                },
                { 
                    model: ServicoModel, 
                    as: 'servico',       // Alias configurado para o serviço
                    attributes: ['nome'] 
                }
            ],
            order: [['data', 'ASC'], ['hora', 'ASC']]
        });
        
        const resultadosFormatados = agendamentos.map(a => ({
            id_agendamento: a.id_agendamento,
            nome_cliente: a.cliente?.nome, // Acessa o nome do cliente
            data: a.data,
            hora: a.hora,
            tratamento: a.servico?.nome, // Acessa o nome do serviço
            status: a.status
        }));
        
        return res.json(resultadosFormatados);

      } else {
        // Se não houver ID do funcionário, retorna todos os agendamentos 
        agendamentos = await AgendamentoModel.findAll({ 
            order: [['data', 'ASC'], ['hora', 'ASC']] 
        }); 
        res.json(agendamentos);
      }

    } catch (error) {
      console.error("Erro ao listar agendamentos do funcionário:", error);
      res.status(500).json({ error: "Erro interno do servidor ao listar agendamentos" });
    }
  },
};

module.exports = AgendamentoFuncionarioController;
