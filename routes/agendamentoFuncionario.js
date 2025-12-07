const express = require("express");
const router = express.Router();

const AgendamentoFuncionarioController = require("../controllers/agendamentoFuncionarioController.js");

router.get("/", AgendamentoFuncionarioController.listar);

module.exports = router;
