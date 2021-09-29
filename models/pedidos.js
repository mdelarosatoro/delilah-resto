const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Pedidos = sequelize.define('pedidos', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    hora: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.NOW
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    }
},
{
    tableName: 'pedidos',
    underscored: true,
    timestamps: false
});

module.exports = Pedidos;