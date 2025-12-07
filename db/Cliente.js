const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Cliente = sequelize.define("Cliente", {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  telefone: {
    type: DataTypes.STRING(20),
  },
  cep: {
    type: DataTypes.STRING(10),
  },
  senha: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  tipo_usuario: {
    type: DataTypes.STRING(20),
    defaultValue: "cliente",
  },
  pontos_fidelidade: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Cliente;
