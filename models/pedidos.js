const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Pedidos = sequelize.define('pedidos', {
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