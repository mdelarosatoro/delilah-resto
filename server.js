//importar librerías
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const cors = require("cors");

//puerto del servidor
const PORT = 3000;

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
const JWT_SECRET = 'Alg00o0oSupPPeRRComPl1C4D000DeDesCiFRar';

//crear instancia del server en express
const server = express();

//politica de limite de peticiones
const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: 3,
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
    next();
}

const validarCamposContrasena = async (req, res, next) => {
    next();
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



//levantar el servidor
server.listen(PORT, () => {
    console.log(`Servidor inicializado correctamente en el puerto ${PORT}.`)
});

