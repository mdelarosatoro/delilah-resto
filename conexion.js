const Sequelize = require("sequelize");

//XAMPP
const {
    DB_USER,
    DB_HOST,
    DB_PASS,
    DB_NAME,
    DB_PORT,
    } = process.env;

const conString = `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log(conString);

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