const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");
const Pedidos = require("./pedidos");
const Platos = require("./platos");

const pedidosHasPlatos = sequelize.define('pedidosHasPlatos', {
    pedidoId: {
        type: DataTypes.INTEGER,
        references: {
            model: Pedidos,
            key: 'id'
        }
    },
    platoId: {
        type: DataTypes.INTEGER,
        references: {
            model: Platos,
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
},
{
    tableName: 'pedidos_has_platos',
    underscored: true,
    timestamps: false
});

module.exports = pedidosHasPlatos;