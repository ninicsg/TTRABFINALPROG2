const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();


const AuthController = {
async register(req, res) {
try {
const { nome, email, senha, tipo_usuario, telefone, cep } = req.body;
if (!email || !senha || !nome) return res.status(400).json({ error: 'nome, email e senha obrigatórios' });


const existente = await Usuario.findOne({ where: { email } });
if (existente) return res.status(400).json({ error: 'Email já cadastrado' });


const hash = await bcrypt.hash(senha, 10);
const novo = await Usuario.create({ nome, email, senha: hash, tipo_usuario, telefone, cep });
res.status(201).json({ message: 'Registrado', usuario: { id_usuario: novo.id_usuario, nome: novo.nome, email: novo.email } });
} catch (error) {
console.error('Erro ao registrar:', error);
res.status(500).json({ error: 'Erro no servidor' });
}
},


async login(req, res) {
try {
const { email, senha, tipo_usuario } = req.body;
if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' });


const user = await Usuario.findOne({ where: { email } });
if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });


if (tipo_usuario && user.tipo_usuario.toLowerCase() !== tipo_usuario.toLowerCase()) {
return res.status(401).json({ error: `Este email pertence a um ${user.tipo_usuario}` });
}


const ok = await bcrypt.compare(senha, user.senha);
if (!ok) return res.status(401).json({ error: 'Senha incorreta' });


const token = jwt.sign({ id: user.id_usuario, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET || 'chave_dev', { expiresIn: '8h' });
res.json({ message: 'Login ok', token, usuario: { id_usuario: user.id_usuario, nome: user.nome, tipo_usuario: user.tipo_usuario } });
} catch (err) {
console.error('Erro no login:', err);
res.status(500).json({ error: 'Erro no servidor' });
}
}
};


module.exports = AuthController;