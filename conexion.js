const Sequelize = require("sequelize");

//XAMPP
const user = 'root';
const pass = 'root';
const host = 'localhost';
const port = '3306';
const dbName = 'delilah-resto';

const conString = `mysql://${user}:${pass}@${host}:${port}/${dbName}`;

const sequelize = new Sequelize(conString);

sequelize
.authenticate()
.then( () => {
    console.log("conexión exitosa con la db...");
})
.catch(error => {
    console.error(error.message);
});

module.exports = sequelize;