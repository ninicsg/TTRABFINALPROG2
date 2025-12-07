const express = require("express");
const router = express.Router();
const AuthModel = require("../models/authModel.js");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const novoUsuario = await AuthModel.register(req.body);
    res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario,
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao cadastrar usuário",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha, tipo_usuario } = req.body;

  try {
    const resultado = await AuthModel.login(email, senha, tipo_usuario);

    if (!resultado.success) {
      return res.status(401).json(resultado);
    }

    const usuario = resultado.usuario;

    const token = jwt.sign(
      { id: usuario.id_usuario, tipo: usuario.tipo_usuario },
      process.env.JWT_SECRET || "chave_secreta123",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      token,
      usuario,
    });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});
module.exports = router;
