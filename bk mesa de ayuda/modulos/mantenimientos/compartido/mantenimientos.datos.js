const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');
const { consultarAniosMantenimientos, consultarResumenSedesMantenimientos, contarMantenimientos, contarMantenimientosPorEstado } = require('../conteo/conteo.servicio');

const consultaMantenimientos = `
  SELECT
    mantenimiento.ID,
    mantenimiento.IDACTIVO,
    mantenimiento.TIPOMANTENIMIENTO,
    mantenimiento.FECHA,
    mantenimiento.DESCRIPCION,
    mantenimiento.DIAGNOSTICO,
    mantenimiento.SOLUCION,
    mantenimiento.RESPONSABLE,
    mantenimiento.ESTADO,
    mantenimiento.FECHAREGISTRO,
    mantenimiento.EVIDENCIA,
    activo.CATEGORIA,
    activo.MARCA,
    activo.MODELO,
    activo.PLACA,
    activo.DESCRIPCIONUBICACION,
    area.NOMBRE AS NOMBREAREA,
    sede.NOMBRE AS NOMBRESEDE,
    mesa.NOMBRE AS NOMBREMESA
  FROM MANTENIMIENTOSMESA mantenimiento
  INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
  INNER JOIN AREASCLB area ON area.ID = activo.IDAREA AND area.idsede = activo.IDSEDE
  INNER JOIN SEDESCLB sede ON sede.ID = area.idsede
  INNER JOIN MESASAYUDA mesa ON mesa.ID = activo.IDMESA
`;

const consultarMantenimientos = async ({ pagina = 1, limite = 0, anio = null, idSede = null, idMesa }) => {
  const conexion = await conectarBaseDatos();
  const consulta = conexion.request().input('IDMESA', sql.Int, idMesa);
  const offset = (pagina - 1) * limite;
  let paginado = '';
  const filtros = ['activo.IDMESA = @IDMESA'];
  if (anio) { consulta.input('ANIO', sql.Int, anio); filtros.push('YEAR(mantenimiento.FECHA) = @ANIO'); }
  if (idSede) { consulta.input('IDSEDE', sql.Int, idSede); filtros.push('activo.IDSEDE = @IDSEDE'); }

  if (limite > 0) {
    consulta.input('REGISTROINICIO', sql.Int, offset);
    consulta.input('LIMITE', sql.Int, limite);
    paginado = 'OFFSET @REGISTROINICIO ROWS FETCH NEXT @LIMITE ROWS ONLY';
  }

  const resultado = await consulta.query(`
    ${consultaMantenimientos}
    ${filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''}
    ORDER BY mantenimiento.ID DESC
    ${paginado}
  `);

  if (limite > 0) {
    return {
      datos: resultado.recordset,
      total: await contarMantenimientos(idMesa, anio, idSede),
      conteos: await contarMantenimientosPorEstado(idMesa, anio, idSede),
      anios: await consultarAniosMantenimientos(idMesa),
      sedes: anio ? await consultarResumenSedesMantenimientos(idMesa, anio) : [],
      pagina,
      limite,
      anio,
      idSede
    };
  }

  return resultado.recordset;
};

const crearMantenimiento = async (mantenimiento, idMesa) => {
  const {
    IDACTIVO,
    TIPOMANTENIMIENTO,
    FECHA,
    DESCRIPCION,
    DIAGNOSTICO,
    SOLUCION,
    RESPONSABLE,
    ESTADO
  } = mantenimiento;

  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('EVIDENCIA', sql.VarChar(sql.MAX), mantenimiento.EVIDENCIA || null)
    .input('CAMBIAREVIDENCIA', sql.Bit, Object.prototype.hasOwnProperty.call(mantenimiento, 'EVIDENCIA'))
    .input('IDACTIVO', sql.Int, IDACTIVO)
    .input('TIPOMANTENIMIENTO', sql.VarChar(50), TIPOMANTENIMIENTO)
    .input('FECHA', sql.DateTime, FECHA ? new Date(FECHA) : new Date())
    .input('DESCRIPCION', sql.VarChar(sql.MAX), DESCRIPCION || null)
    .input('DIAGNOSTICO', sql.VarChar(sql.MAX), DIAGNOSTICO || null)
    .input('SOLUCION', sql.VarChar(sql.MAX), SOLUCION || null)
    .input('RESPONSABLE', sql.VarChar(100), RESPONSABLE || null)
    .input('ESTADO', sql.VarChar(30), ESTADO || 'FINALIZADO')
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      INSERT INTO MANTENIMIENTOSMESA (
        IDACTIVO,
        TIPOMANTENIMIENTO,
        FECHA,
        DESCRIPCION,
        DIAGNOSTICO,
        SOLUCION,
        RESPONSABLE,
        ESTADO,
        EVIDENCIA
      )
      OUTPUT INSERTED.*
      SELECT
        @IDACTIVO,
        @TIPOMANTENIMIENTO,
        @FECHA,
        @DESCRIPCION,
        @DIAGNOSTICO,
        @SOLUCION,
        @RESPONSABLE,
        @ESTADO,
        @EVIDENCIA
      WHERE EXISTS (
        SELECT 1 FROM INVENTARIOSMESA
        WHERE ID = @IDACTIVO AND IDMESA = @IDMESA
      )
    `);

  return resultado.recordset[0];
};

const editarMantenimiento = async (id, mantenimiento, idMesa) => {
  const {
    IDACTIVO,
    TIPOMANTENIMIENTO,
    FECHA,
    DESCRIPCION,
    DIAGNOSTICO,
    SOLUCION,
    RESPONSABLE,
    ESTADO
  } = mantenimiento;

  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ID', sql.Int, id)
    .input('EVIDENCIA', sql.VarChar(sql.MAX), mantenimiento.EVIDENCIA || null)
    .input('CAMBIAREVIDENCIA', sql.Bit, Object.prototype.hasOwnProperty.call(mantenimiento, 'EVIDENCIA'))
    .input('IDACTIVO', sql.Int, IDACTIVO)
    .input('TIPOMANTENIMIENTO', sql.VarChar(50), TIPOMANTENIMIENTO)
    .input('FECHA', sql.DateTime, FECHA ? new Date(FECHA) : new Date())
    .input('DESCRIPCION', sql.VarChar(sql.MAX), DESCRIPCION || null)
    .input('DIAGNOSTICO', sql.VarChar(sql.MAX), DIAGNOSTICO || null)
    .input('SOLUCION', sql.VarChar(sql.MAX), SOLUCION || null)
    .input('RESPONSABLE', sql.VarChar(100), RESPONSABLE || null)
    .input('ESTADO', sql.VarChar(30), ESTADO || 'FINALIZADO')
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      UPDATE MANTENIMIENTOSMESA
      SET
        IDACTIVO = @IDACTIVO,
        TIPOMANTENIMIENTO = @TIPOMANTENIMIENTO,
        FECHA = @FECHA,
        DESCRIPCION = @DESCRIPCION,
        DIAGNOSTICO = @DIAGNOSTICO,
        SOLUCION = @SOLUCION,
        RESPONSABLE = @RESPONSABLE,
        ESTADO = @ESTADO,
        EVIDENCIA = CASE WHEN @CAMBIAREVIDENCIA = 1 THEN @EVIDENCIA ELSE EVIDENCIA END
      OUTPUT INSERTED.*
      WHERE ID = @ID
        AND EXISTS (
          SELECT 1 FROM INVENTARIOSMESA activoActual
          WHERE activoActual.ID = MANTENIMIENTOSMESA.IDACTIVO
            AND activoActual.IDMESA = @IDMESA
        )
        AND EXISTS (
          SELECT 1 FROM INVENTARIOSMESA activoNuevo
          WHERE activoNuevo.ID = @IDACTIVO
            AND activoNuevo.IDMESA = @IDMESA
        )
    `);

  return resultado.recordset[0] || null;
};

const cambiarEstadoMantenimiento = async (id, estado, idMesa) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ID', sql.Int, id)
    .input('ESTADO', sql.VarChar(30), estado)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      UPDATE MANTENIMIENTOSMESA
      SET ESTADO = @ESTADO
      OUTPUT INSERTED.*
      WHERE ID = @ID
        AND EXISTS (
          SELECT 1 FROM INVENTARIOSMESA activo
          WHERE activo.ID = MANTENIMIENTOSMESA.IDACTIVO
            AND activo.IDMESA = @IDMESA
        )
    `);

  return resultado.recordset[0] || null;
};

const eliminarMantenimiento = async (id, idMesa) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ID', sql.Int, id)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      DELETE mantenimiento
      FROM MANTENIMIENTOSMESA mantenimiento
      INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
      WHERE mantenimiento.ID = @ID AND activo.IDMESA = @IDMESA
    `);

  return resultado.rowsAffected[0] > 0;
};

module.exports = {
  consultarMantenimientos,
  crearMantenimiento,
  editarMantenimiento,
  cambiarEstadoMantenimiento,
  eliminarMantenimiento
};
