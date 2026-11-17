const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const crearActivo = async (activo) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('NUMEROSERIE', sql.VarChar(100), activo.NUMEROSERIE || null)
    .input('CATEGORIA', sql.VarChar(100), activo.CATEGORIA)
    .input('MARCA', sql.VarChar(100), activo.MARCA || null)
    .input('MODELO', sql.VarChar(100), activo.MODELO || null)
    .input('PLACA', sql.VarChar(50), activo.PLACA || null)
    .input('DESCRIPCIONUBICACION', sql.VarChar(sql.MAX), activo.DESCRIPCIONUBICACION || null)
    .input('FOTO', sql.VarChar(sql.MAX), activo.FOTO || null)
    .input('IDAREA', sql.Int, activo.IDAREA)
    .input('IDSEDE', sql.Int, activo.IDSEDE)
    .input('IDMESA', sql.Int, activo.IDMESA)
    .query(`
      INSERT INTO INVENTARIOSMESA (
        NUMEROSERIE, CATEGORIA, MARCA, MODELO, PLACA,
        DESCRIPCIONUBICACION, FOTO, IDAREA, IDSEDE, IDMESA
      )
      OUTPUT INSERTED.*
      VALUES (
        @NUMEROSERIE, @CATEGORIA, @MARCA, @MODELO, @PLACA,
        @DESCRIPCIONUBICACION, @FOTO, @IDAREA, @IDSEDE, @IDMESA
      )
    `);
  return resultado.recordset[0];
};

module.exports = { crearActivo };
