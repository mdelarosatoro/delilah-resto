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
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
},
{
    tableName: 'pedidos',
    underscored: true,
    timestamps: false
});

module.exports = Pedidos;