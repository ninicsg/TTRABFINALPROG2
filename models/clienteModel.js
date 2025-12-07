const { DataTypes } = require("sequelize");
const sequelize = require("../db/index.js"); // importa a conexão com o banco

const ClienteModel = sequelize.define("usuario", {
  id_usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  tipo_usuario: {
    type: DataTypes.ENUM("admin", "cliente", "funcionario"),
    allowNull: false,
    defaultValue: "cliente",
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "123456", //padrao caso nao digite senha
  },
  pontos_fidelidade: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,//nao aceita valores negativos
    },
  },
}, {
  tableName: "usuario", // nome da tabela no banco
  timestamps: false,
});


module.exports = ClienteModel;
