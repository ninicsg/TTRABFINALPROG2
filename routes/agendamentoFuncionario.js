const express = require("express");
const router = express.Router();

// Importação correta: Pega o objeto COMPLETO AgendamentoFuncionarioController
// que foi exportado como um módulo.
const AgendamentoFuncionarioController = require("../controllers/agendamentoFuncionarioController.js");

// Define a rota GET para a URL base (que é /agendamentosfuncionario no server.js).
// Acessa o método 'listar' do objeto importado.
router.get("/", AgendamentoFuncionarioController.listar);

module.exports = router;