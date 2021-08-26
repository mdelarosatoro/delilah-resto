const { DataTypes } = require("Sequelize");
const sequelize = require("../conexion");

const Usuarios = require("./usuarios");
const Estados = require("./estados");
const metodosPago = require("./metodosPago");
const Pedidos = require("./pedidos");
const Platos = require("./platos");

Usuarios.hasMany(Pedidos, {
    foreignKey: 'usuarios_id'
});
Pedidos.belongsTo(Usuarios);

metodosPago.hasMany(Pedidos, {
    foreignKey: 'metodos_pago_id'
});
Pedidos.belongsTo(metodosPago);

Estados.hasMany(Pedidos, {
    foreignKey: 'estados_id'
});
Pedidos.belongsTo(Estados);

const pedidosHasPlatos = sequelize.define('pedidosHasPlatos', {
    pedidosId: {
        type: DataTypes.INTEGER,
        references: {
            model: Pedidos,
            key: 'id'
        }
    },
    platosId: {
        type: DataTypes.INTEGER,
        references: {
            model: Platos,
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
{
    tableName: 'pedidos_has_platos',
    underscored: true,
    timestamps: false
});

Platos.belongsToMany(Pedidos, { through: pedidosHasPlatos });
Pedidos.belongsToMany(Platos, { through: pedidosHasPlatos });

(async () => {
    try {
        await sequelize.sync();
    } catch (error) { 
        console.error(error.message);
    }
})();

module.exports = {
    Usuarios,
    Estados,
    metodosPago,
    Pedidos,
    Platos,
    pedidosHasPlatos
}