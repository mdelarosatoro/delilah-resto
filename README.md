# delilah-resto
API para pedidos de restaurante utilizando Node.js, Express, JWT, Sequelize y MySQL2.


Para utilizar este repositorio, se debe utilizar la instrucción `npm install` para instalar todas las dependencias del proyecto.

Para la base de datos, pueden utilizar un servidor MySQL como XAMPP o un servidor MySQL remoto.

Dependiendo de su configuración, deberán crear un archivo `.env` y reemplazar los datos de ejemplo eque aparecen en el archivo `.env.example` con los datos de su entorno.
Una vez configurado el archivo .env con su configuración, correr el servidor con la siguiente instrucción:

`nodemon server.js`

Una vez corriendo el servidor, utilizar la colección de postman para poder probar los endpoints. Podrán ejectuar las siguientes funcionalidades sobre la base de datos:

- Crear y editar usuarios
- Crear y editar platos
- Crear y editar métodos de pago
- Crear y editar estados de pedido
- Crear y editar pedidos

Los endpoints `/login` y `/registrar` son los únicos endpoints que no requieren un JWT Authorization Header para interactuar. Para el resto, se debe registrar un nuevo usuario en la base de datos y luego hacer login con los datos correspondientes. El servidor enviará un JWT que será guardado en el localStorage del cliente. Para el resto de endpoints, será necesario enviar el siguiente header de autorización: `Authorization: 'Bearer token'`, en donde la palabra 'token' será reemplazada por el token guardado en localStorage. Los tokens expiran a los 30 minutos de su creación, por lo que deberá volver a loggearse al servidor para obtener un nuevo token luego de expirarse el antiguo.

## Instrucciones de uso:

1. Crear un usuario a través del endpoint POST `/registrar`.

Para poder registrar un usuario, deberá enviar un JSON con el siguiente formato:
`
{
    "usuario": "test",
    "nombreApellido": "Test User",
    "correo": "test@test.com",
    "telefono": "+99 999 999 999",
    "direccion": "Test Street 123",
    "contrasena": "123456"
}
    `

3. Ingresar a la base de datos y cambiar el valor del campo `is_admin` a `1`.
4. Hacer login con el usuario creado a través del endpoint `/login`

Para hacer login, deberá enviar un JSON con el siguiente formato:
`{
    "correo": "test@test.com",
    "contrasena": "123456" 
}`

El servidor responderá con un JSON Web Token, el cual deberá guardar y enviar como Authorization Header en posteriores requests a cualquier endpoint protegido. Según el tipo de endpoint, algunos validarán si el usuario es administrador para poder acceder, como los de editar pedidos y platos.

6. Crear varios platos, incluyendo url de imagen, precio y nombre a través del endpoint `/platos`.

8. Crear diversos métodos de pago a través del respectivo endpoint `/metodos-pago`

10. Crear estados de pedido necesarios a través del respectivo endpoint `/estados`

12. Crear un pedido indicando el id de cada plato y su cantidad, además del id del método de pago al final a través del endpoint `/pedidos`

Este repositorio es puramente un backend programado en Nodejs con Express. Para conectarlo a un frontend se utilizaría el Fetch API de JavaScript o una librería como Axios para realizar los HTTP requests pertinentes al servidor y poder pintar la data en el frontend.
