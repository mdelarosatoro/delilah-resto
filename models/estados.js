const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Estados = sequelize.define('estados', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    tableName: 'estados',
    underscored: true,
    timestamps: false
});

module.exports = Estados;