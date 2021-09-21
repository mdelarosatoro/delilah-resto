//importar librerías
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const cors = require("cors");
const bcrypt = require("bcrypt");
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

//password hashing rounds
const saltRounds = 10;

//secret key
const { JWT_SECRET } = process.env;

//crear instancia del server en express
const server = express();

//politica de limite de peticiones
const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: 30,
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
        res.status(400).json({error: `Usuario '${usuario}' ya existe. Pruebe con otro.`});
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
        imgUrl,
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

const validarCamposPlatoActivo = (req, res, next) => {
    const { activo } = req.body;

    if (!(activo == true || activo == false)) {
        res.status(400).json({error: `Debe ingresar un estado correcto (true o false)`})
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

const validarCamposNuevoPedido = async (req, res, next) => {
    const { platos, metodoPagoId } = req.body;

    for (const plato of platos) {
        const platoDB = await Platos.findOne({
            where: {
                id: plato.platoId,
                activo: true
            }
        });
    
        if (!platoDB) {
            res.status(400).json({error: `Plato activo con id ${plato.platoId} no existe en la DB.`});
        }
    }

    const metodoDB = await metodosPago.findOne({
        where: {
            id: metodoPagoId
        }
    })

    if (!metodoDB) {
        res.status(400).json({error: `Metodo de pago con id ${metodoPagoId} no existe en la DB.`});
    }

    next();
}

const validarExistenciaPlato = async (req, res, next) => {
    const platoId = req.body.platoId || req.params.idPlato;

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

const validarExistenciaPedido = async (req, res, next) => {
    try {
        const { idPedido } = req.params;

        const pedido = await Pedidos.findOne({
            where: {
                id: idPedido
            }
        });
        
        if (!pedido) {
            res.status(401).json({error: `Pedido con id ${idPedido} no existe en la DB.`})
        } else {
            next();
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error: `Inténtelo más tarde.`})
    }
}

const validarExistenciaEstado = async (req, res, next) => {
    const { idEstado } = req.body;

    const posibleEstado = await Estados.findOne({
        where: {
            id: idEstado
        }
    });

    if (!posibleEstado) {
        res.status(401).json({error: `Estado con id ${idEstado} no existe en la DB.`})
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

        //password hashing
        bcrypt.hash(contrasena, saltRounds, async function(err, hash) {
            const nuevoUsuario = await Usuarios.create({
                usuario,
                nombreApellido,
                correo,
                telefono,
                direccion,
                contrasena: hash
            });

            res.status(201).json(nuevoUsuario);
        });
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
                correo
            }
        });

        
        if (!posibleUsuario) {
            res.status(401).json({error: "compruebe email y/o contraseña."});
        } else {
            const hash = posibleUsuario.contrasena;
    
            bcrypt.compare(contrasena, hash, function(err, result) {
                if (!result) {
                    res.status(401).json({error: "compruebe email y/o contraseña."});
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
            });

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
        res.status(500).json({error: error.message});
    }
});

//GET conseguir todos los platos
server.get("/platos/all",
validarAdministrador,
async (req, res) => {
    try {
        const platos = await Platos.findAll({});
        
        res.status(200).json(platos);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET conseguir todos los platos activos (usuario no admin)
server.get("/platos",
validarAdministrador,
async (req, res) => {
    try {
        const platos = await Platos.findAll({
            where: {
                activo: true
            }
        });

        res.status(200).json(platos);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//GET conseguir un plato por id
server.get("/platos/:idPlato",
validarExistenciaPlato,
async (req, res) => {
    try {
        const { idPlato } = req.params;
        const plato = await Platos.findOne({
            where: {
                id: idPlato
            }
        })

        res.status(200).json(plato);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//PUT actualizar un plato por id
server.put("/platos/:idPlato",
validarAdministrador,
validarExistenciaPlato,
validarCamposNuevoPlato,
async (req, res) => {
    try {
        const { idPlato } = req.params;
        const { nombre, precio, imgUrl } = req.body;

        const platoDB = await Platos.update({
            nombre,
            precio,
            imgUrl
        },
        {
            where: {
                id: idPlato
            }
        });

        res.status(200).json(`Plato con id ${idPlato} actualizado correctamente.`);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

//PUT activar o desactivar un plato
server.put("/platos/:idPlato/estado",
validarAdministrador,
validarExistenciaPlato,
validarCamposPlatoActivo,
async (req, res) => {
    try {
        const { idPlato } = req.params;
        const { activo } = req.body;

        Platos.update({
            activo
        },
        {
            where: {
                id: idPlato
            }
        });

        res.status(200).json(`Plato con id ${idPlato} cambiado a estado ${activo?"activo":"desactivado"}`);
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
validarNuevoEstado,
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
validarCamposNuevoPedido,
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
        }   

        const result = descripcion.join(", ");

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

//PUT modificar pedido por id
server.put("/pedidos/:idPedido",
validarAdministrador,
validarExistenciaPedido,
validarCamposNuevoPedido,
async (req, res) => {
    try {
        const { idPedido } = req.params;
        const { platos, metodoPagoId } = req.body;

        const pedido = await Pedidos.findOne({
            where: {
                id: idPedido
            }
        });

        pedido.setMetodosPago(metodoPagoId);

        await pedidosHasPlatos.destroy({
            where: {
                pedidoId: idPedido
            }
        });

        for (const plato of platos) {
            await pedido.addPlatos(plato.platoId);
            
            await pedidosHasPlatos.update({
                cantidad: plato.cantidad
            },
            {
                where: {
                    pedidoId: idPedido,
                    platoId: plato.platoId
                }
            });
        }

        //actualizar el total
        //primero debo buscar en la tabla pedidosHasPlatos, todos los platos del pedido actual
        const platosPedidoActual = await pedidosHasPlatos.findAll({
            where: {
                pedidoId: idPedido
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
        await Pedidos.update({
            total: totalPedido
        }, {
            where: {
                id: idPedido
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
        }   

        const result = descripcion.join(", ");

        await Pedidos.update({
            descripcion: result
        },{
            where: {
                id: idPedido
            }
        });

        res.status(201).json(`Pedido con id ${idPedido} actualizado correctamente.`);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({error: error.message});
    }
});

//GET visualizar todos los pedidos del usuario loggeado
server.get("/mis-pedidos", async (req, res) => {
    try {
        const userId = req.user.id;

        const pedidos = await Pedidos.findAll({
            attributes: ["id","hora", "descripcion", "total"],
            include: [
                {
                    model: Usuarios,
                    attributes: ["nombreApellido", "correo", "telefono", "direccion"],
                    where: {
                        id: userId
                    }
                },
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
});

//GET visualizar todos los pedidos
server.get("/pedidos/all",
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

//conseguir pedido por id
server.get("/pedidos/:idPedido",
validarAdministrador,
validarExistenciaPedido,
async (req, res) => {
    try {
        const { idPedido } = req.params;

        const pedido = await Pedidos.findOne({
            attributes: ["id","hora", "descripcion", "total"],
            where: {
                id: idPedido
            },
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

        res.status(200).json(pedido);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

server.put("/pedidos/:idPedido/estado",
validarAdministrador,
validarExistenciaPedido,
validarExistenciaEstado,
async (req, res) => {
    try {
        const { idPedido } = req.params;
        const { idEstado } = req.body;

        const pedido = await Pedidos.findOne({
            where: {
                id: idPedido
            }
        });
        await pedido.setEstado(idEstado);

        res.status(200).json(`Pedido con id ${idPedido} cambiado a Estado con id ${idEstado} de forma exitosa.`);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

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
                    id: favorito,
                    activo: true
                }
            });
            
            platoActual && arrayDePlatos.push(platoActual.dataValues);
        }

        // console.log(arrayDePlatos);

        res.status(200).json(arrayDePlatos.length > 0?arrayDePlatos:`No tiene platos añadidos en favoritos.`);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
});

server.get("/admin-test",
validarAdministrador,
async (req, res) => {
    res.status(200).json(`Success.`)
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