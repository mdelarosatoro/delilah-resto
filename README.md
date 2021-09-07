# delilah-resto
API para pedidos de restaurante utilizando Node.js, Express, Sequelize y MySQL2.


Para utilizar este repositorio, se debe utilizar la instrucción `npm install` para instalar todas las dependencias del proyecto.

Para la base de datos, pueden utilizar un servidor MySQL como XAMPP o un servidor MYSQL remoto.

Dependiendo de su configuración, deberán crear un archivo .env y reemplazar los datos que aparecen en el archivo .env.example con los datos de su entorno.
Una vez configurado el archivo .env con su configuración, correr el servidor con la siguiente instrucción:

`nodemon server.js`

Una vez corriendo el servidor, utilizar la colección de postman para poder probar los endpoints. Podrán ejectuar las siguientes funcionalidades sobre la base de datos:

- Crear usuarios
- Crear platos
- Crear métodos de pago
- Crear estados de pedido
- Crear pedidos

## Instrucciones de uso:

1. Crear un usuario a través del endpoint `/registrar`.
2. Ingresar a la base de datos y cambiar el valor del campo `is_admin` a `1`.
3. Hacer login con el usuario creado a través del endpoint `/login`
4. Crear varios platos, incluyendo url de imagen, precio y nombre a través del endpoint `platos`.
5. Crear diversos métodos de pago a través del respectivo endpoint `/metodos-pago`
6. Crear estados de pedido necesarios a través del respectivo endpoint `/estados`
7. Crear un pedido indicando el id de cada plato y su cantidad, además del id del método de pago al final a través del endpoint `/pedidos`

Este repositorio es puramente un backend programado en Nodejs con Express. Para conectarlo a un frontend se utilizaría el Fetch API de JavaScript para realizar los HTTP requests pertinentes al servidor y poder pintar la data en el frontend.
