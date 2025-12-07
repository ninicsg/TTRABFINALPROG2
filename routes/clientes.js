const express = require("express");
const router = express.Router();
// 🚨 Nota: O seu arquivo importava 'ClienteController', 
// mas o controller exporta 'ClientesController' (plural). 
// Corrigi para usar o nome correto do módulo exportado.
const ClientesController = require("../controllers/clienteController.js");

// 1. Rota GET / (Listar todos os clientes)
// Ex: GET /homeadmin/gerenciarclientes
router.get("/", ClientesController.listar);

// 2. Rota DELETE /:id (Excluir um cliente específico)
// Ex: DELETE /homeadmin/gerenciarclientes/67
router.delete("/:id", ClientesController.deletar);

// 🚨 3. Rota POST / (Adicionar um novo cliente) 🚨
// Ex: POST /homeadmin/gerenciarclientes
router.post("/", ClientesController.criar);

module.exports = router;