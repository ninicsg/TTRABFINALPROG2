const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Usuario = sequelize.define('usuario', {
id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
nome: { type: DataTypes.STRING(100), allowNull: false },
email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
senha: { type: DataTypes.STRING(255), allowNull: false },
telefone: { type: DataTypes.STRING(20), allowNull: true },
cep: { type: DataTypes.STRING(10), allowNull: true },
tipo_usuario: {
  type: DataTypes.ENUM('admin','funcionario','cliente'),
  allowNull: false,
  defaultValue: 'cliente'
},
pontos_fidelidade: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
tableName: 'usuario',
timestamps: false
});


module.exports = Usuario;