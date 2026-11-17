const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const consultarCatalogo = async (tabla) => {
  const tablasPermitidas = new Set(['SEDESCLB', 'MESASAYUDA']);
  if (!tablasPermitidas.has(tabla)) throw new Error('Catálogo no permitido');

  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request().query(`
    SELECT ID, NOMBRE
    FROM ${tabla}
    ORDER BY NOMBRE
  `);
  return resultado.recordset;
};

const consultarAreas = async (sede) => {
  const conexion = await conectarBaseDatos();
  const consulta = conexion.request();
  let filtroSede = '';

  if (sede) {
    consulta.input('IDSEDE', sql.Int, sede);
    filtroSede = 'WHERE sede.ID = @IDSEDE';
  }

  const resultado = await consulta.query(`
    SELECT area.ID, area.NOMBRE, area.idsede AS IDSEDE, sede.NOMBRE AS NOMBRESEDE
    FROM AREASCLB area
    INNER JOIN SEDESCLB sede ON sede.ID = area.idsede
    ${filtroSede}
    ORDER BY area.NOMBRE
  `);
  return resultado.recordset;
};

const consultarInventario = async ({ pagina = 1, limite = 0, idMesa }) => {
  const conexion = await conectarBaseDatos();
  const consulta = conexion.request().input('IDMESA', sql.Int, idMesa);
  const offset = (pagina - 1) * limite;
  let paginado = '';

  if (limite > 0) {
    consulta.input('REGISTROINICIO', sql.Int, offset);
    consulta.input('LIMITE', sql.Int, limite);
    paginado = 'OFFSET @REGISTROINICIO ROWS FETCH NEXT @LIMITE ROWS ONLY';
  }

  const resultado = await consulta.query(`
    SELECT
      inventario.ID, inventario.NUMEROSERIE, inventario.CATEGORIA,
      inventario.MARCA, inventario.MODELO, inventario.PLACA,
      inventario.DESCRIPCIONUBICACION, inventario.FOTO, inventario.IDAREA,
      area.NOMBRE AS NOMBREAREA, inventario.IDSEDE,
      sede.NOMBRE AS NOMBRESEDE, inventario.IDMESA,
      mesa.NOMBRE AS NOMBREMESA, inventario.FECHAREGISTRO
    FROM INVENTARIOSMESA inventario
    INNER JOIN AREASCLB area ON area.ID = inventario.IDAREA AND area.idsede = inventario.IDSEDE
    INNER JOIN SEDESCLB sede ON sede.ID = area.idsede
    INNER JOIN MESASAYUDA mesa ON mesa.ID = inventario.IDMESA
    WHERE inventario.IDMESA = @IDMESA
    ORDER BY inventario.ID DESC
    ${paginado}
  `);

  if (limite <= 0) return resultado.recordset;

  return {
    datos: resultado.recordset,
    pagina,
    limite
  };
};

module.exports = { consultarCatalogo, consultarAreas, consultarInventario };
