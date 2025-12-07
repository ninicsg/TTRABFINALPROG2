const express = require("express");
const router = express.Router();
const ClientesController = require("../controllers/clienteController.js");

router.get("/", ClientesController.listar);

router.delete("/:id", ClientesController.deletar);

router.post("/", ClientesController.criar);

module.exports = router;
