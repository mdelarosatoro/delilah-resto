const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Platos = sequelize.define('platos', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imgUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    tableName: 'platos',
    underscored: true,
    timestamps: false
});

module.exports = Platos;