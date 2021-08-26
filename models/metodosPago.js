const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const metodosPago = sequelize.define('metodosPago', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    tableName: 'metodos_pago',
    underscored: true,
    timestamps: false
});

module.exports = metodosPago