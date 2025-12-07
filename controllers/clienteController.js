const UsuarioModel = require("../models/usuarioModel.js"); 

const ClientesController = {
    async listar(req, res) {
        try {
            // sequelize busca todos onde tipo_usuario é 'cliente'
            const clientes = await UsuarioModel.findAll({
                where: { tipo_usuario: 'cliente' }
            });
            
            res.json(clientes);
        } catch (error) {
            console.error("Erro ao listar clientes:", error);
            res.status(500).json({ error: "Erro interno ao buscar clientes" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            
            const deleted = await UsuarioModel.destroy({
                where: { id_usuario: id } 
            });

            if (deleted) {
                return res.status(204).send(); // 204 No Content para sucesso sem retorno de corpo
            }
            
            // Se deleted for 0, significa que o registro não foi encontrado.
            res.status(404).json({ error: "Cliente não encontrado ou já excluído." });
            
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            
            // Erro de integridade de dados
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(409).json({ 
                    error: "Não é possível excluir o cliente.", 
                    details: "Este cliente possui registros dependentes (ex: agendamentos, histórico, reservas) e deve ser desativado em vez de excluído."
                });
            }

            res.status(500).json({ error: "Erro interno ao deletar cliente." });
        }
    },
    async criar(req, res) {
        try {
            // Captura os dados necessários do corpo da requisição
            const { nome, email, senha, telefone } = req.body;
            
            // Configura os dados do novo cliente
            const dadosCliente = {
                nome,
                email,
                senha, 
                telefone,
                tipo_usuario: 'cliente' // Força o tipo para garantir que seja um cliente
            };

            const novoCliente = await UsuarioModel.create(dadosCliente);
            // Retorna 201 Created e os dados do cliente criado
            res.status(201).json(novoCliente); 
            
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            
            // Lida com erros de validação do sequelize
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ 
                    error: "Erro de validação ao criar cliente.", 
                    details: error.errors.map(e => e.message) 
                });
            }

            res.status(500).json({ error: "Erro interno ao criar cliente." });
        }
    },

};

module.exports = ClientesController;
