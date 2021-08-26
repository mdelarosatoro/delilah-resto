const { DataTypes } = require("sequelize");
const sequelize = require("../conexion");

const Estados = sequelize.define('estados', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
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