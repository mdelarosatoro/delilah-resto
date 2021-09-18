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
```json
{
    "usuario": "test",
    "nombreApellido": "Test User",
    "correo": "test@test.com",
    "telefono": "+99 999 999 999",
    "direccion": "Test Street 123",
    "contrasena": "123456"
}
```

3. Ingresar a la base de datos y cambiar el valor del campo `is_admin` a `1`.
4. Hacer login con el usuario creado a través del endpoint `/login`

Para hacer login, deberá enviar un JSON con el siguiente formato:
```json
{
    "correo": "test@test.com",
    "contrasena": "123456" 
}
```

El servidor responderá con un JSON Web Token, el cual deberá guardar y enviar como Authorization Header en posteriores requests a cualquier endpoint protegido. Según el tipo de endpoint, algunos validarán si el usuario es administrador para poder acceder, como los de editar pedidos y platos.

6. Crear varios platos, incluyendo url de imagen, precio y nombre a través del endpoint `/platos`.

Para crear un nuevo plato, deberá estar loggeado en una cuenta de administrador y enviar un objeto JSON con este formato:
```json
{
    "nombre": "Calzone",
    "precio": 40,
    "imgUrl": "https://i.blogs.es/0b4bb9/calzone/840_560.jpg"
}
```

8. Crear diversos métodos de pago a través del respectivo endpoint `/metodos-pago`

Para crear un nuevo método de pago, deberá estar loggeado en una cuenta de administrador y enviar un objeto JSON con este formato:
```json
{
    "nombre": "Efectivo",
}
```

10. Crear estados de pedido necesarios a través del respectivo endpoint `/estados`

Para crear un nuevo estado de pedido, deberá estar loggeado en una cuenta de administrador y enviar un objeto JSON con este formato:
```json
{
    "nombre": "En preparación",
}
```

12. Crear un pedido indicando el id de cada plato y su cantidad, además del id del método de pago al final a través del endpoint `/pedidos`

Para crear un nuevo pedido, deberá estar loggeado en cualquier usuario y enviar un objeto JSON con este formato:
```json
{
    "platos": [
        {
            "platoId": 1,
            "cantidad": 1
        }
],
    "metodoPagoId": 1
}
```

El array de platos deberá contener el carrito de compras generado en el frontend, que contiene en cada index un objeto con el id del plato y la cantidad que se desea pedir. Después de la propiedad platos, agregar una propiedad llamada "metodoPagoId" en el cual ingresarás el id del método de pago que usará el cliente para pagar.

De haber creado correctamente el pedido, recibirá el siguiente mensaje:

`"Pedido generado correctamente con id __."`

Indicando el id generado automáticamente por la base de datos. Luego, el administrador podrá consultar con ese id la información del pedido a través del endpoint `/pedidos/:idPedido` o un usuario normal podrá revisar todos sus pedidos activos utilizando el endpoint `/mis-pedidos`. Se recibirá un objeto JSON con el siguiente formato, mostrando la información del/ de los pedido(s).

```json
{
    "id": 9,
    "hora": "2021-09-18T04:43:21.000Z",
    "descripcion": "1X Calzone",
    "total": 40,
    "usuario": {
        "nombreApellido": "Max De La Rosa Toro",
        "correo": "mdelarosatoroag@gmail.com",
        "telefono": "+51 979 391 974",
        "direccion": "Alameda Las Palmas 154, Urb. La Encantada de Villa, Chorrillos"
    },
    "metodosPago": {
        "id": 1,
        "nombre": "Credit Card"
    },
    "estado": {
        "id": 1,
        "nombre": "Nuevo"
    },
    "platos": [
        {
            "id": 1,
            "nombre": "Calzone",
            "precio": 40,
            "imgUrl": "https://i.blogs.es/0b4bb9/calzone/840_560.jpg",
            "activo": true,
            "pedidosHasPlatos": {
                "cantidad": 1
            }
        }
    ]
}
```


Este repositorio es puramente un backend programado en Nodejs con Express. Para conectarlo a un frontend se utilizaría el Fetch API de JavaScript o una librería como Axios para realizar los HTTP requests pertinentes al servidor y poder pintar la data en el frontend.
