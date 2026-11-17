const { createHash, timingSafeEqual } = require('node:crypto');
const sql = require('mssql');
const { conexion } = require('../../../config/db');

module.exports = async function solicitanteWhatsApp(req, res, next) {
  const huella = process.env.MESA80_CHATBOT_TOKEN_SHA256;
  const token = /^Bearer (\S+)$/i.exec(req.get('authorization') || '')?.[1];
  if (!token || !/^[a-f0-9]{64}$/.test(huella || '') ||
      req.usuario.usuario !== 'chatbot' || Number(req.usuario.idMesa) !== 1 ||
      !timingSafeEqual(createHash('sha256').update(token).digest(), Buffer.from(huella, 'hex'))) {
    return res.sendStatus(403);
  }

  const usuario = req.body?.solicitante;
  if (typeof usuario !== 'string' || !usuario.trim() || usuario.length > 100) {
    return res.status(400).json({ ok: false, mensaje: 'Usuario solicitante inválido.' });
  }

  try {
    const pool = await conexion();
    const { recordset } = await pool.request()
      .input('usuario', sql.VarChar(100), usuario.trim())
      .query('SELECT TOP (2) ID FROM USUARIOSMESA WHERE ESTADO = 1 AND LOWER(LTRIM(RTRIM(USUARIO))) = LOWER(@usuario)');
    if (recordset.length !== 1) {
      return res.status(400).json({ ok: false, mensaje: 'El usuario solicitante no está activo o es ambiguo.' });
    }
    req.idSolicitanteWhatsApp = Number(recordset[0].ID);
    return next();
  } catch (error) {
    return next(error);
  }
};
