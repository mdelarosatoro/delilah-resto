//importar librerías
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const cors = require("cors");
require("dotenv").config();

//puerto del servidor
const { SERVER_PORT } = process.env;

//importar objeto de sequelize
const sequelize = require("./conexion");

//importar modelos
const {
    Usuarios,
    Estados,
    metodosPago,
    Pedidos,
    Platos,
    pedidosHasPlatos
} = require("./models");

//secret key
const { JWT_SECRET } = process.env;

//crear instancia del server en express
const server = express();

//politica de limite de peticiones
const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: 10,
    message: "Excediste el número de peticiones. Intenta más tarde."
});

//logger
const logger = (req, res, next) => {
    const path = req.path;
    const method = req.method;
    const body = req.body;

    process.nextTick( () => {console.log(`
    Método: ${method}
    Ruta: ${path}
    Body: ${JSON.stringify(body)}
    Params: ${JSON.stringify(req.params)}
    `)});

    next();
}

//middlewares globales
server.use(express.json());
server.use(compression());
server.use(helmet());
server.use(cors());
server.use(limiter);
server.use(logger);

//proteger endpoints menos el login y registro
server.use(expressJwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
    }).unless({
        path: ["/login", "/registrar"]
    })
);

const validarCamposRegistro = (req, res, next) => {
    const {
        usuario,
        nombreApellido,
        correo,
        telefono,
        direccion,
        contrasena
    } = req.body;

    if (
        !usuario || usuario == "" ||
        !nombreApellido || nombreApellido == "" ||
        !correo || correo == "" ||
        !telefono || telefono == "" ||
        !direccion || direccion == "" ||
        !contrasena || contrasena == ""
    ) {
        res.status(400).json({error: `Debe completar todos los campos correctamente.`});
    } else {
        next();
    }
}

const validarUsuarioUnico = async (req, res, next) => {
    const { usuario } = req.body;

    const posibleUsuario = await Usuarios.findOne({
        where: {
            usuario
        }
    });

    if (posibleUsuario) {
        res.status(400).json({error: `Usuario ${usuario} ya existe. Pruebe con otro.`});
    } else {
        next();
    }
}

const validarEmailUnico = async (req, res, next) => {
    const { correo } = req.body;

    const posibleUsuario = await Usuarios.findOne({
        where: {
            correo
        }
    });

    if (posibleUsuario) {
        res.status(400).json({error: `Correo ${correo} ya existe. Pruebe con otro.`});
    } else {
        next();
    }
}

const validarTamanoContrasena = async (req, res, next) => {
    const { contrasena } = req.body;

    if (contrasena.length < 6) {
        res.status(400).json({error: `Contraseña demasiado corta. Intente con más de 6 caracteres.`})
    } else {
        next();
    }
}

const validarCamposEmail = async (req, res, next) => {
    const { correo } = req.body;

    if ( correo == "" || correo == null) {
        res.status(400).json({error: `Debe introducir un correo electrónico.`})
    } else if ( !correo.slice().split("").some(element => element === "@" )) {
        res.status(400).json({error: `El correo que introdujo no contiene el símbolo '@'. Inténtelo nuevamente.`});
    } else if ( !correo.slice().split("").some(element => element === "." )) {
        res.status(400).json({error: `El correo que introdujo no contiene el símbolo '.'. Inténtelo nuevamente.`});
    } else {
        next();
    }
}

const validarCamposContrasena = async (req, res, next) => {
    const { contrasena } = req.body;

    if ( contrasena == "" || contrasena == null) {
        res.status(400).json({error: `Debe introducir una contraseña.`})
    } else {
        next();
    }
}

const validarCamposNuevoPlato = async (req, res, next) => {
    const {
        nombre,
        precio,
        imgUrl
    } = req.body;

    if (
        nombre == "" || nombre == null ||
        precio == "" || precio == null ||
        imgUrl == "" || nombre == null
    ) {
        res.status(400).json({error: `Debe ingresar todos los campos. Intente nuevamente.`});
    } else {
        next();
    }
}

const validarNuevoMetodoPago = async (req, res, next) => {
    const { nombre } = req.body;

    if ( nombre == "" || nombre == null ) {
        res.status(400).json({error: `Debe ingresar un nombre para el nuevo método de pago.`});
    } else {
        const metodoExiste = await metodosPago.findOne({
            where: {
                nombre
            }
        });

        if (metodoExiste) {
            res.status(400).json({error: `Un método de pago con el nombre '${nombre}' ya existe. Intente con un nombre distinto.`});
        } else {
            next();
        }
    }
}

const validarNuevoEstado = async (req, res, next) => {
    const { nombre } = req.body;

    if ( nombre == "" || nombre == null ) {
        res.status(400).json({error: `Debe ingresar un nombre para el nuevo método de pago.`});
    } else {
        const estadoExiste = await Estados.findOne({
            where: {
                nombre
            }
        });

        if (estadoExiste) {
            res.status(400).json({error: `Un estado con el nombre '${nombre}' ya existe. Intente con un nombre distinto.`});
        } else {
            next();
        }
    }
}

const validarExistenciaPlato = async (req, res, next) => {
    const { platoId } = req.body;

    const platoDB = await Platos.findOne({
        where: {
            id: platoId
        }
    });

    if (!platoDB) {
        res.status(400).json({error: `Plato con id ${platoId} no existe en la DB.`});
    } else {
        next();
    }
}

const validarAdministrador = async (req, res, next) => {
    const usuario = req.user.usuario;

    const userDB = await Usuarios.findOne({
        attributes: ["is_admin"],
        where: {
            usuario
        }
    });

    if (userDB.dataValues.is_admin == 0) {
        res.status(400).json({error: `Usuario ${usuario} no es administrador.`});
    } else {
        next();
    }
}

//ENDPOINTS
//registrar usuario
server.post("/registrar",
validarCamposRegistro,
validarUsuarioUnico,
validarEmailUnico,
validarTamanoContrasena,
async (req, res) => {
    try {
        const {
            usuario,
            nombreApellido,
            correo,
            telefono,
            direccion,
            contrasena
        } = req.body;
    
        const nuevoUsuario = await Usuarios.create({
            usuario,
            nombreApellido,
            correo,
            telefono,
            direccion,
            contrasena
        });
    
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error: `Ocurrió un error. Vuevlve a intentarlo.`})
    }
});

//login usuario
server.post("/login",
validarCamposEmail,
validarCamposContrasena,
async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        const posibleUsuario = await Usuarios.findOne({
            where: {
                correo,
                contrasena
            }
        });

        if (!posibleUsuario) {
            res.status(401).json({error: "compruebe email y/o contraseña."})
        } else {
            const token = jwt.sign({
                id: posibleUsuario.id,
                usuario: posibleUsuario.usuario,
                correo: posibleUsuario.correo,
                nombreApellido: posibleUsuario.nombreApellido
            },
            JWT_SECRET,
            { expiresIn: "60m" });

            res.status(200).json({token});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

//GET conseguir user-data
server.get("/user-data", async (req, res) => {
    try {
        const { usuario } = req.user;
    
        const userDB = await Usuarios.findOne({
            where: {
                usuario
            }
        });
        
        res.status(200).json(userDB);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

//POST crear un nuevo plato
server.post("/platos",
validarAdministrador,
validarCamposNuevoPlato,
async (req, res) => {
    try {
        const {
            nombre,
            precio,
            imgUrl
        } = req.body;
    
        const nuevoPlato = await Platos.create({
            nombre,
            precio,
            imgUrl
        });
    
        res.status(201).json(nuevoPlato);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET conseguir todos los platos
server.get("/platos",
async (req, res) => {
    try {
        const platos = await Platos.findAll({});

        res.status(200).json(platos);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//POST crear un nuevo método de pago
server.post("/metodos-pago",
validarAdministrador,
validarNuevoMetodoPago,
async (req, res) => {
    try {
        const { nombre } = req.body;

        const nuevoMetodo = await metodosPago.create({
            nombre
        });

        res.status(201).json(nuevoMetodo);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET mostrar todos los métodos de pago
server.get("/metodos-pago",
async (req, res) => {
    try {
        const metodosArray = await metodosPago.findAll({});

        res.status(200).json(metodosArray);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//POST crear un nuevo estado de pedido
server.post("/estados",
validarAdministrador,
validarNuevoMetodoPago,
async (req, res) => {
    try {
        const { nombre } = req.body;

        const nuevoEstado = await Estados.create({
            nombre
        });

        res.status(201).json(nuevoEstado);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET mostrar todos los estados de pedido
server.get("/estados",
async (req, res) => {
    try {
        const estadosArray = await Estados.findAll({});

        res.status(200).json(estadosArray);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//POST crear un nuevo pedido
server.post("/pedidos",
async (req, res) => {
    try {
        const { platos, metodoPagoId } = req.body

        const user = req.user;

        const nuevoPedido = await Pedidos.create({
            hora: Date(),
        });

        //relacionando el pedido con el id del usuario
        await nuevoPedido.setUsuario(user.id);
        //relacionando el pedido con el estado 'nuevo'
        await nuevoPedido.setEstado(1);
        //relacionando el pedido con el metodo de pago elegido en el frontend
        await nuevoPedido.setMetodosPago(metodoPagoId);

        //relacionar el pedido con cada plato y cantidad
        for (const plato of platos) {
            await nuevoPedido.addPlatos(plato.platoId);
            
            await pedidosHasPlatos.update({
                cantidad: plato.cantidad
            },
            {
                where: {
                    pedidoId: nuevoPedido.id,
                    platoId: plato.platoId
                }
            });
        }

        //actualizar el total
        //primero debo buscar en la tabla pedidosHasPlatos, todos los platos del pedido actual
        const platosPedidoActual = await pedidosHasPlatos.findAll({
            where: {
                pedidoId: nuevoPedido.id
            }
        });

        // console.log(platosPedidoActual);
        let totalPedido = 0;
        
        for (const plato of platosPedidoActual) {
            const precioPlatoActual = await Platos.findOne({
                attributes: ['precio'],
                where: {
                    id: plato.platoId
                }
            });
            totalPedido += plato.cantidad * precioPlatoActual.dataValues.precio;
        }
        
        totalPedido = Math.round(totalPedido*100) / 100;
        
        //guardar el total del pedido en la DB
        await nuevoPedido.update({
            total: totalPedido
        }, {
            where: {
                id: nuevoPedido.id
            }
        })
        
        //armar la descripcion del pedido
        let descripcion = [];

        for (const plato of platos) {
            const auxiliar = [];
            auxiliar.push(`${plato.cantidad.toString()}X`);
            const descripcionDB = await Platos.findOne({
                attributes: ["nombre"],
                where: {
                    id: plato.platoId
                }
            });
            const descripcionString = descripcionDB.dataValues.nombre;
            auxiliar.push(`${descripcionString}`);
            descripcion.push(auxiliar.join(" "));
            console.log(descripcion);
        }   

        const result = descripcion.join(", ");
        console.log(result);

        await Pedidos.update({
            descripcion: result,
        },{
            where: {
                id: nuevoPedido.id
            }
        });


        // console.log(nuevoPedido);

        res.status(201).json(`Pedido generado correctamente con id ${nuevoPedido.id}.`);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET visualizar todos los pedidos
server.get("/pedidos",
validarAdministrador,
async (req, res) => {
    try {

        const pedidos = await Pedidos.findAll({
            attributes: ["id","hora", "descripcion", "total"],
            include: [
            {model: Usuarios,
            attributes: ["nombreApellido", "correo", "telefono", "direccion"]},
            {model: metodosPago,},
            {model: Estados,},
            {
                model: Platos,
                through: { attributes: ["cantidad"] }
            }
        ]
        });

        res.status(200).json(pedidos);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
})

//POST agregar un plato a favoritos
server.post("/favoritos",
validarExistenciaPlato,
async (req, res) => {
    try {
        const { platoId } = req.body;
        const usuario = req.user.usuario;

        const favoritosActual = await Usuarios.findOne({
            attributes: ["favoritos"],
            where: {
                usuario
            }
        });

        const favoritosArr = JSON.parse(favoritosActual.favoritos);

        const index = favoritosArr.findIndex((favoritoId) => {
            return favoritoId == platoId
        });

        //para solo poder agregar un plato una vez (toggle)
        if (index === -1) {
            favoritosArr.push(platoId);
        } else {
            favoritosArr.splice(index, 1);
        }

        console.log(favoritosArr)

        await Usuarios.update({
            favoritos: favoritosArr
        },{
            where: {
                usuario
            }
        })

        res.status(200).json(JSON.stringify(favoritosArr));
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET Visualizar platos favoritos
server.get("/favoritos",
async (req, res) => {
    try {
        const usuario = req.user.usuario;
    
        const favoritosActual = await Usuarios.findOne({
            attributes: ["favoritos"],
            where: {
                usuario
            }
        });
    
        const favoritosArr = JSON.parse(favoritosActual.favoritos);
        const arrayDePlatos = [];
    
        //buscar cada plato en la base de datos y agregarlo a un array de objetos
        for (const favorito of favoritosArr) {
            console.log(favorito)
            const platoActual = await Platos.findOne({
                where: {
                    id: favorito
                }
            });
            
            arrayDePlatos.push(platoActual.dataValues);
        }

        // console.log(arrayDePlatos);

        res.status(200).json(arrayDePlatos);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});


server.get("/test", async (req, res) => {
    try {
        res.status(200).json(`User verified.`);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//levantar el servidor
server.listen(SERVER_PORT, () => {
    console.log(`Servidor inicializado correctamente en el puerto ${SERVER_PORT}.`)
});

