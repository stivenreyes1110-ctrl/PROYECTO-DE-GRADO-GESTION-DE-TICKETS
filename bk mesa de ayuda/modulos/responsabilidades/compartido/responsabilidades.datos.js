const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

let verificacionEsquema;
const asegurarEsquemaResponsabilidades = (pool) => {
  if (!verificacionEsquema) {
    verificacionEsquema = pool.request().query(`
      IF OBJECT_ID('dbo.RESPONSABILIDADES', 'U') IS NULL
        THROW 50001, 'No existe la tabla dbo.RESPONSABILIDADES', 1;

      IF COL_LENGTH('dbo.RESPONSABILIDADES', 'ESTADO') IS NULL
        ALTER TABLE dbo.RESPONSABILIDADES
          ADD ESTADO VARCHAR(30) NOT NULL
          CONSTRAINT DF_RESPONSABILIDADES_ESTADO DEFAULT ('PENDIENTE') WITH VALUES;

      IF COL_LENGTH('dbo.RESPONSABILIDADES', 'PORCENTAJE') IS NULL
        ALTER TABLE dbo.RESPONSABILIDADES
          ADD PORCENTAJE TINYINT NOT NULL
          CONSTRAINT DF_RESPONSABILIDADES_PORCENTAJE DEFAULT (0) WITH VALUES;
    `).catch((error) => {
      verificacionEsquema = null;
      throw error;
    });
  }
  return verificacionEsquema;
};

const consultaBase = `
  SELECT
    responsabilidad.ID,
    responsabilidad.DESCRIPCION,
    responsabilidad.IDAREA,
    responsabilidad.IDSOPORTE,
    responsabilidad.FECHAINICIO,
    responsabilidad.FECHAFIN,
    responsabilidad.IDMESA,
    responsabilidad.ESTADO,
    responsabilidad.PORCENTAJE,
    responsabilidad.FECHAREGISTRO,
    area.NOMBRE AS NOMBREAREA,
    usuario.NOMBRE AS NOMBRESOPORTE
  FROM RESPONSABILIDADES responsabilidad
  INNER JOIN AREASCLB area ON area.ID = responsabilidad.IDAREA
  INNER JOIN SOPORTESMESA soporte ON soporte.ID = responsabilidad.IDSOPORTE
    AND soporte.IDMESA = responsabilidad.IDMESA
  INNER JOIN USUARIOSMESA usuario ON usuario.ID = soporte.IDUSUARIO
`;

const consultarResponsabilidades = async (idMesa) => {
  const pool = await conectarBaseDatos();
  await asegurarEsquemaResponsabilidades(pool);
  const resultado = await pool.request()
    .input('IDMESA', sql.Int, idMesa)
    .query(`${consultaBase}
      WHERE responsabilidad.IDMESA = @IDMESA
      ORDER BY responsabilidad.FECHAINICIO, responsabilidad.ID DESC
    `);

  return resultado.recordset;
};

const crearResponsabilidad = async (datos, idMesa) => {
  const pool = await conectarBaseDatos();
  await asegurarEsquemaResponsabilidades(pool);
  const resultado = await pool.request()
    .input('DESCRIPCION', sql.VarChar(500), datos.DESCRIPCION.trim())
    .input('IDAREA', sql.Int, datos.IDAREA)
    .input('IDSOPORTE', sql.Int, datos.IDSOPORTE)
    .input('FECHAINICIO', sql.Date, datos.FECHAINICIO)
    .input('FECHAFIN', sql.Date, datos.FECHAFIN)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      INSERT INTO RESPONSABILIDADES (
        DESCRIPCION, IDAREA, IDSOPORTE, FECHAINICIO, FECHAFIN, IDMESA
      )
      OUTPUT INSERTED.*
      SELECT @DESCRIPCION, @IDAREA, @IDSOPORTE, @FECHAINICIO, @FECHAFIN, @IDMESA
      WHERE EXISTS (
        SELECT 1 FROM SOPORTESMESA
        WHERE ID = @IDSOPORTE AND IDMESA = @IDMESA
      )
    `);

  return resultado.recordset[0] || null;
};

const editarResponsabilidad = async (id, datos, idMesa) => {
  const pool = await conectarBaseDatos();
  await asegurarEsquemaResponsabilidades(pool);
  const resultado = await pool.request()
    .input('ID', sql.Int, id)
    .input('DESCRIPCION', sql.VarChar(500), datos.DESCRIPCION.trim())
    .input('IDAREA', sql.Int, datos.IDAREA)
    .input('IDSOPORTE', sql.Int, datos.IDSOPORTE)
    .input('FECHAINICIO', sql.Date, datos.FECHAINICIO)
    .input('FECHAFIN', sql.Date, datos.FECHAFIN)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      UPDATE RESPONSABILIDADES
      SET DESCRIPCION = @DESCRIPCION,
          IDAREA = @IDAREA,
          IDSOPORTE = @IDSOPORTE,
          FECHAINICIO = @FECHAINICIO,
          FECHAFIN = @FECHAFIN
      OUTPUT INSERTED.*
      WHERE ID = @ID
        AND IDMESA = @IDMESA
        AND EXISTS (
          SELECT 1 FROM SOPORTESMESA
          WHERE ID = @IDSOPORTE AND IDMESA = @IDMESA
        )
    `);

  return resultado.recordset[0] || null;
};

const eliminarResponsabilidad = async (id, idMesa, idRol, idSoporte) => {
  const pool = await conectarBaseDatos();
  await asegurarEsquemaResponsabilidades(pool);
  const resultado = await pool.request()
    .input('ID', sql.Int, id)
    .input('IDMESA', sql.Int, idMesa)
    .input('IDROL', sql.Int, idRol)
    .input('IDSOPORTE', sql.Int, idSoporte || null)
    .query(`
      DELETE FROM RESPONSABILIDADES
      WHERE ID = @ID AND IDMESA = @IDMESA
        AND (@IDROL = 1 OR IDSOPORTE = @IDSOPORTE)
    `);

  return resultado.rowsAffected[0] > 0;
};

const actualizarEstadoResponsabilidad = async (id, estado, idMesa, idRol, idSoporte) => {
  const pool = await conectarBaseDatos();
  await asegurarEsquemaResponsabilidades(pool);
  const porcentaje = estado === 'FINALIZADO' ? 100 : estado === 'EN PROCESO' ? 50 : 0;
  const resultado = await pool.request()
    .input('ID', sql.Int, id)
    .input('ESTADO', sql.VarChar(30), estado)
    .input('PORCENTAJE', sql.TinyInt, porcentaje)
    .input('IDMESA', sql.Int, idMesa)
    .input('IDROL', sql.Int, idRol)
    .input('IDSOPORTE', sql.Int, idSoporte || null)
    .query(`
      UPDATE RESPONSABILIDADES
      SET ESTADO = @ESTADO, PORCENTAJE = @PORCENTAJE
      OUTPUT INSERTED.*
      WHERE ID = @ID AND IDMESA = @IDMESA
        AND (@IDROL = 1 OR IDSOPORTE = @IDSOPORTE)
    `);
  return resultado.recordset[0] || null;
};

module.exports = {
  consultarResponsabilidades,
  crearResponsabilidad,
  editarResponsabilidad,
  actualizarEstadoResponsabilidad,
  eliminarResponsabilidad
};
