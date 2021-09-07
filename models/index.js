const sequelize = require("../conexion");

const Usuarios = require("./usuarios");
const Estados = require("./estados");
const metodosPago = require("./metodosPago");
const Pedidos = require("./pedidos");
const Platos = require("./platos");
const pedidosHasPlatos = require("./pedidosHasPlatos");


//Relaciones
//Usuarios 1 y Pedidos muchos
Usuarios.hasMany(Pedidos, {
    foreignKey: 'usuario_id'
});
Pedidos.belongsTo(Usuarios);

//Métodos de pago 1 y pedidos muchos
metodosPago.hasMany(Pedidos, {
    foreignKey: 'metodos_pago_id'
});
Pedidos.belongsTo(metodosPago);

//Estado 1 y pedido muchos
Estados.hasMany(Pedidos, {
    foreignKey: 'estado_id'
});
Pedidos.belongsTo(Estados);

//Pedidos muchos y platos muchos
Platos.belongsToMany(Pedidos, { through: pedidosHasPlatos });
Pedidos.belongsToMany(Platos, { through: pedidosHasPlatos });


/*código para sincronizar las tablas en el servidor
mysql con los modelos de sequelize
Descomentarlo al realizar cambios en los modelos o sus relaciones.
Esto borrará la base de datos y sincronizará los nuevos modelos y relaciones

*Una vez sincronizado volverlo a comentar.
*/

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