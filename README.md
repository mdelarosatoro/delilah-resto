# delilah-resto
API para pedidos de restaurante utilizando Node.js, Express, JWT, Sequelize y MySQL2.


Para la base de datos, pueden utilizar un servidor MySQL como XAMPP o un servidor MySQL remoto.

Una vez corriendo el servidor, utilizar la colección de postman para poder probar los endpoints. Podrán ejectuar las siguientes funcionalidades sobre la base de datos:

- Crear y editar usuarios
- Crear y editar platos
- Crear y editar métodos de pago
- Crear y editar estados de pedido
- Crear y editar pedidos

Los endpoints `/login` y `/registrar` son los únicos endpoints que no requieren un JWT Authorization Header para interactuar. Para el resto, se debe registrar un nuevo usuario en la base de datos y luego hacer login con los datos correspondientes. El servidor enviará un JWT que será guardado en el localStorage del cliente. Para el resto de endpoints, será necesario enviar el siguiente header de autorización: `Authorization: 'Bearer token'`, en donde la palabra 'token' será reemplazada por el token guardado en localStorage. Los tokens expiran a los 30 minutos de su creación, por lo que deberá volver a loggearse al servidor para obtener un nuevo token luego de expirarse el antiguo.

## Instrucciones de uso:

### Creación de Base de Datos:

1. Para utilizar este repositorio, se debe utilizar la instrucción `npm install` para instalar todas las dependencias del proyecto.

2. Inicializar el servidor MySQL que van a utilizar. Se puede utilizar una aplicación como XAMPP que permite generar un servidor MySQL local o utilizar un servidor remoto.

3. Crear un schema dentro del servidor MySQL el cual deberá tener el mismo nombre que el parámetro `DB_NAME` en el siguiente paso.

4. Dependiendo de su configuración de entorno según el tipo de servidor MySQL que se escogió, deberán crear un archivo `.env` y reemplazar los datos de ejemplo que aparecen en el archivo `.env.example` con los datos de su entorno local. Especificar el usuario y contraseña necesarios para ingresar a la base de datos, ingresar el host y puerto de la base de datos. Cambiar la variable `JWT_SECRET` a cualquier string complicado, que servirá para codificar los JWT. Ingresar el puerto donde correrá el servidor y guardar el archivo con el nombre `.env`.

```
DB_USER=admin
DB_PASS=admin
DB_HOST=localhost
DB_PORT=2222
DB_NAME=db-name
JWT_SECRET=SomeReallyLongAndComplicatedString12312·"!
SERVER_PORT=1111
```

5. Ingresar a la carpeta `/models` y abrir el archivo `index.js` y ubicarse entre las líneas 43 y 49 en donde encontrarán un código comentado con esta forma: 

```
(async () => {
    try {
        await sequelize.sync({force: true});
    } catch (error) { 
        console.error(error.message);
    }
})();
```
6. Descomentar el código entre las líneas 43 y 49 del archivo `index.js`, abrir la terminal y correr el comando `nodemon server.js`. El código descomentado sincronizará todos los modelos con la base de datos.

7. Volver a comentar el código, ya que de otra forma cada vez que se realice un cambio en el código volver a limpiar toda la base de datos. Cada vez que se quiera realizar algún cambio en los modelos, se tendrá que volver a correr el código del paso 5 para reestructurar y limpiar la base de datos.

8. El servidor de node y la base de datos están conectadas satisfactoriamente y se puede proseguir a ingresar datos en la DB.


### Uso del API

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

3. Ingresar a la base de datos y cambiar el valor del campo `is_admin` a `1` en la tabla `usuarios` del usuario recién registrado.

5. Hacer login con el usuario creado a través del endpoint `/login`

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
    "nombre": "Nuevo",
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
        "nombreApellido": "Test User",
        "correo": "test@test.com",
        "telefono": "+99 999 999 999",
        "direccion": "Test Street 123"
    },
    "metodosPago": {
        "id": 1,
        "nombre": "Efectivo"
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
