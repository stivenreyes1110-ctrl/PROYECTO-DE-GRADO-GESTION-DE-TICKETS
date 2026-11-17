const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const editarActivo = async (id, activo) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ID', sql.Int, id)
    .input('NUMEROSERIE', sql.VarChar(100), activo.NUMEROSERIE || null)
    .input('CATEGORIA', sql.VarChar(100), activo.CATEGORIA)
    .input('MARCA', sql.VarChar(100), activo.MARCA || null)
    .input('MODELO', sql.VarChar(100), activo.MODELO || null)
    .input('PLACA', sql.VarChar(50), activo.PLACA || null)
    .input('DESCRIPCIONUBICACION', sql.VarChar(sql.MAX), activo.DESCRIPCIONUBICACION || null)
    .input('CAMBIARFOTO', sql.Bit, Object.prototype.hasOwnProperty.call(activo, 'FOTO'))
    .input('FOTO', sql.VarChar(sql.MAX), activo.FOTO || null)
    .input('IDAREA', sql.Int, activo.IDAREA)
    .input('IDSEDE', sql.Int, activo.IDSEDE)
    .input('IDMESA', sql.Int, activo.IDMESA)
    .query(`
      UPDATE INVENTARIOSMESA
      SET NUMEROSERIE = @NUMEROSERIE, CATEGORIA = @CATEGORIA,
          MARCA = @MARCA, MODELO = @MODELO, PLACA = @PLACA,
          DESCRIPCIONUBICACION = @DESCRIPCIONUBICACION,
          FOTO = CASE WHEN @CAMBIARFOTO = 1 THEN @FOTO ELSE FOTO END,
          IDAREA = @IDAREA, IDSEDE = @IDSEDE, IDMESA = @IDMESA
      OUTPUT INSERTED.*
      WHERE ID = @ID AND IDMESA = @IDMESA
    `);
  return resultado.recordset[0] || null;
};

module.exports = { editarActivo };
