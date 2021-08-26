const { DataTypes } = require("Sequelize");
const sequelize = require("../conexion");

const Usuarios = require("./usuarios");
const Estados = require("./estados");
const metodosPago = require("./metodosPago");
const Pedidos = require("./pedidos");
const Platos = require("./platos");

Usuarios.hasMany(Pedidos, {
    foreignKey: 'usuario_id'
});
Pedidos.belongsTo(Usuarios);

metodosPago.hasMany(Pedidos, {
    foreignKey: 'metodos_pago_id'
});
Pedidos.belongsTo(metodosPago);

Estados.hasMany(Pedidos, {
    foreignKey: 'estado_id'
});
Pedidos.belongsTo(Estados);

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

Platos.belongsToMany(Pedidos, { through: pedidosHasPlatos });
Pedidos.belongsToMany(Platos, { through: pedidosHasPlatos });

// (async () => {
//     try {
//         await sequelize.sync({force: true});
//     } catch (error) { 
//         console.error(error.message);
//     }
// })();

module.exports = {
    Usuarios,
    Estados,
    metodosPago,
    Pedidos,
    Platos,
    pedidosHasPlatos
}