const usuarioService = require('./usuarios.servicio');


/*
==================================================
INDICE
==================================================

1. LOSUSUARIOS
2. LOSSOPORTES

==================================================
*/


//1. LOSUSUARIOS
const losUsuarios = async (req, res) => {
    try {


        console.log('2.SE HIZO UNA CONSULTA DE USUARIOS')
        console.log(" ");
        console.log(" ");


        const usuarios = await usuarioService.losUsuarios();


        res.json(usuarios)


    } catch (error) {


        console.log(error);


        res.status(500).json({


            error: 'Error del servidor'


        })
    }
}



//2. LOSSOPORTES
const losSoportes = async (req, res) => {
    try {


        console.log('SE HIZO UNA CONSULTA DE USUARIOS SOPORTES')


        const mesaToken = Number(req.usuario.idMesa);
        const mesaParametro = Number(req.params.mesa);
        const mesa = mesaToken || mesaParametro;

        if (!mesa) {
            return res.status(400).json({ error: 'No se indicó una mesa activa' });
        }

        if (mesaToken && mesaParametro && mesaToken !== mesaParametro) {
            return res.status(403).json({ error: 'No tiene acceso a la mesa solicitada' });
        }


        const soportes = await usuarioService.losSoportes(mesa);


        res.json(soportes)

        
    } catch (error) {


        console.log(error);
        res.status(500).json({error: 'Error del servidor'})


    }
}

const validarAdministrador = (req, res) => {
    if (Number(req.usuario?.idRol) !== 1) {
        res.status(403).json({ error: 'Esta acción es exclusiva para administradores de la mesa' });
        return false;
    }
    return true;
};

const consultarRolesMesa = async (req, res) => {
    if (!validarAdministrador(req, res)) return;
    try {
        const mesa = Number(req.usuario.idMesa);
        if (!mesa) return res.status(400).json({ error: 'La sesión no tiene una mesa activa' });
        return res.json(await usuarioService.consultarUsuariosPorMesa(mesa));
    } catch (error) {
        console.error('[USUARIOS_ROLES_ERROR]', error);
        return res.status(500).json({ error: 'Error al consultar usuarios y roles' });
    }
};

const asignarRolSoporte = async (req, res) => {
    if (!validarAdministrador(req, res)) return;
    try {
        const mesa = Number(req.usuario.idMesa);
        const idUsuario = Number(req.params.idUsuario);
        if (!mesa || !idUsuario) return res.status(400).json({ error: 'Mesa o usuario inválido' });
        const usuario = await usuarioService.convertirUsuarioEnSoporte(idUsuario, mesa);
        return res.json({ mensaje: 'Usuario asignado como soporte en la mesa activa', usuario });
    } catch (error) {
        console.error('[ASIGNAR_SOPORTE_ERROR]', error);
        if (Number(error.number) === 50002) {
            return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
        }
        return res.status(500).json({ error: 'Error al asignar el rol de soporte' });
    }
};

const actualizarRolMesa = async (req, res) => {
    if (!validarAdministrador(req, res)) return;
    try {
        const mesa = Number(req.usuario.idMesa);
        const idUsuario = Number(req.params.idUsuario);
        const idRol = Number(req.body.IDROL);
        if (!mesa || !idUsuario || ![1, 2].includes(idRol)) {
            return res.status(400).json({ error: 'Mesa, usuario o rol inválido' });
        }
        const usuario = await usuarioService.asignarRolUsuario(idUsuario, idRol, mesa, req.usuario.idUsuario);
        return res.json({ mensaje: 'Rol actualizado en la mesa activa', usuario });
    } catch (error) {
        console.error('[ACTUALIZAR_ROL_ERROR]', error);
        const erroresDominio = {
            50002: [404, 'Usuario no encontrado o inactivo'],
            50003: [409, 'No puedes cambiar tu propio rol'],
            50004: [409, 'La mesa debe conservar al menos un administrador'],
            50005: [400, 'Temporalmente sólo se permiten los roles Administrador y Soporte']
        };
        const respuestaError = erroresDominio[Number(error.number)];
        if (respuestaError) return res.status(respuestaError[0]).json({ error: respuestaError[1] });
        return res.status(500).json({ error: 'Error al actualizar el rol' });
    }
};

module.exports = {


    losUsuarios,
    losSoportes,
    consultarRolesMesa,
    asignarRolSoporte,
    actualizarRolMesa

    
}
