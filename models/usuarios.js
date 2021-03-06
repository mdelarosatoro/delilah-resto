const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Usuarios = sequelize.define('usuarios', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombreApellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    favoritos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    isAdmin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: false
    }
},
{
    tableName: 'usuarios',
    underscored: true,
    timestamps: false
});

module.exports = Usuarios;