require('dotenv').config();

const sql = require('mssql');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { conexion } = require('../../config/db');

const losLogin = async ({ usuario, password, mesa }, req) => {
    const idMesaSeleccionada = Number(mesa);
    if (!Number.isInteger(idMesaSeleccionada) || idMesaSeleccionada <= 0) {
        throw new Error('Mesa no valida');
    }

    const pool = await conexion();
    let direccionIpUsuario = req.headers['x-forwarded-for']?.split(',')[0]
        || req.socket.remoteAddress
        || 'desconocida';
    direccionIpUsuario = direccionIpUsuario.replace('::ffff:', '');

    const resultado = await pool.request()
        .input('usuario', sql.VarChar, usuario)
        .input('mesa', sql.Int, idMesaSeleccionada)
        .query(`
            SELECT
                U.ID AS IDUSUARIO,
                U.NOMBRE,
                U.USUARIO,
                U.ESTADO,
                U.IDROL AS IDROL_USUARIO,
                U.CONTRASENA,
                S.ID AS IDSOPORTE,
                S.IDMESA,
                S.IDROL AS IDROL_MESA
            FROM USUARIOSMESA U
            LEFT JOIN SOPORTESMESA S
              ON S.IDUSUARIO = U.ID
             AND S.IDMESA = @mesa
            WHERE U.USUARIO = @usuario;
        `);

    const usuarioConsultado = resultado.recordset[0];
    if (!usuarioConsultado) throw new Error('Usuario no encontrado');

    const hashIngresado = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex')
        .toUpperCase();

    if (hashIngresado !== usuarioConsultado.CONTRASENA) {
        throw new Error('Contraseña incorrecta');
    }

    const tieneRelacionMesa = Number.isInteger(Number(usuarioConsultado.IDSOPORTE))
        && Number(usuarioConsultado.IDSOPORTE) > 0
        && Number(usuarioConsultado.IDMESA) === idMesaSeleccionada;
    const rolMesa = Number(usuarioConsultado.IDROL_MESA);
    const rolEfectivo = tieneRelacionMesa && [1, 2].includes(rolMesa) ? rolMesa : 3;
    const idSoporteEfectivo = rolEfectivo === 3 ? null : Number(usuarioConsultado.IDSOPORTE);

    const token = jwt.sign(
        {
            idUsuario: usuarioConsultado.IDUSUARIO,
            idRol: rolEfectivo,
            idMesa: idMesaSeleccionada,
            idSoporte: idSoporteEfectivo,
            usuario: usuarioConsultado.USUARIO
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    console.info('[LOGIN_MESA]', JSON.stringify({
        idUsuario: usuarioConsultado.IDUSUARIO,
        usuario: usuarioConsultado.USUARIO,
        idMesa: idMesaSeleccionada,
        idRol: rolEfectivo,
        idSoporte: idSoporteEfectivo,
        accesoSoporte: rolEfectivo !== 3,
        ip: direccionIpUsuario
    }));

    return {
        token,
        ip: direccionIpUsuario,
        id: idSoporteEfectivo,
        id_usuario: usuarioConsultado.IDUSUARIO,
        usuario: usuarioConsultado.USUARIO,
        nombre: usuarioConsultado.NOMBRE,
        idrol: rolEfectivo,
        mesa: idMesaSeleccionada,
        idmesa: idMesaSeleccionada,
        tieneAccesoSoporte: rolEfectivo !== 3,
        versionAcceso: 2
    };
};

module.exports = { losLogin };
