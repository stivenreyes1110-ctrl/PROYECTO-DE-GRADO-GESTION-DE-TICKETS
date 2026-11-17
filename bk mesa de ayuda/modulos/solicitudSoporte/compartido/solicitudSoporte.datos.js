const sql = require('mssql');
const { conexion } = require('../../../config/db');

const aMayusculas = (valor) => String(valor || '').trim().toLocaleUpperCase('es-CO');

const seleccionSolicitud = `
  SELECT
    T.ID AS ID_TICKET,
    T.DIRIP,
    T.UBICACIONFISICA,
    T.HORAREGISTRO,
    T.HORACIERRE,
    T.PRIORIDAD,
    T.DESCRIPCION,
    T.CONTESTACION,
    T.IDSOPORTE,
    T.IDMESA,
    T.IDINCIDENTE,
    T.IDAREA,
    T.IDSEDE,
    T.ARCHIVO_URL,
    US.NOMBRE AS USUARIO_ASIGNADO,
    I.NOMBRE AS INCIDENTE,
    A.NOMBRE AS AREA,
    SD.NOMBRE AS SEDE,
    M.NOMBRE AS MESA_AYUDA,
    U.NOMBRE AS USUARIO_SOLICITANTE,
    CASE T.ESTADO
      WHEN 1 THEN 'PENDIENTE'
      WHEN 2 THEN 'EN PROCESO'
      WHEN 3 THEN 'SOLUCIONADO'
      ELSE 'SIN ESTADO'
    END AS ESTADO
  FROM TICKETSMESA T
  LEFT JOIN INCIDENTESMESA I ON T.IDINCIDENTE = I.ID
  LEFT JOIN AREASCLB A ON T.IDAREA = A.ID
  LEFT JOIN SEDESCLB SD ON T.IDSEDE = SD.ID
  LEFT JOIN MESASAYUDA M ON T.IDMESA = M.ID
  LEFT JOIN USUARIOSMESA U ON T.IDUSUARIO = U.ID
  LEFT JOIN SOPORTESMESA S ON T.IDSOPORTE = S.ID
  LEFT JOIN USUARIOSMESA US ON S.IDUSUARIO = US.ID
`;

const agregarFiltroTexto = (request, condiciones, nombre, valor, expresion) => {
  const filtro = String(valor || '').trim();
  if (!filtro) return;
  request.input(nombre, sql.NVarChar(250), `%${filtro}%`);
  condiciones.push(`${expresion} LIKE @${nombre}`);
};

const prepararConsultaListado = (request, { idUsuario, idMesa, estado, filtros = {} }) => {
  const condiciones = [
    'T.IDUSUARIO = @IDUSUARIO',
    'T.IDMESA = @IDMESA'
  ];

  request.input('IDUSUARIO', sql.Int, idUsuario);
  request.input('IDMESA', sql.Int, idMesa);

  if ([1, 2, 3].includes(Number(estado))) {
    request.input('ESTADO', sql.Int, Number(estado));
    condiciones.push('T.ESTADO = @ESTADO');
  }

  agregarFiltroTexto(request, condiciones, 'FILTROTICKET', filtros.ticket, `CONCAT(T.ID, ' ', ISNULL(T.DIRIP, ''))`);
  agregarFiltroTexto(request, condiciones, 'FILTRODEPENDENCIA', filtros.dependencia, `CONCAT(ISNULL(A.NOMBRE, ''), ' ', ISNULL(SD.NOMBRE, ''))`);
  agregarFiltroTexto(request, condiciones, 'FILTROSOLICITUD', filtros.solicitud, `CONCAT(ISNULL(T.DESCRIPCION, ''), ' ', ISNULL(I.NOMBRE, ''))`);
  agregarFiltroTexto(request, condiciones, 'FILTROPRIORIDAD', filtros.prioridad, `ISNULL(T.PRIORIDAD, '')`);
  agregarFiltroTexto(request, condiciones, 'FILTROESTADOTEXTO', filtros.estadoTexto, `CASE T.ESTADO WHEN 1 THEN 'PENDIENTE' WHEN 2 THEN 'EN PROCESO' WHEN 3 THEN 'SOLUCIONADO' ELSE 'SIN ESTADO' END`);
  agregarFiltroTexto(request, condiciones, 'FILTROREGISTRO', filtros.registro, `CONVERT(VARCHAR(19), T.HORAREGISTRO, 120)`);
  agregarFiltroTexto(request, condiciones, 'FILTRORESPUESTA', filtros.respuesta, `ISNULL(T.CONTESTACION, '')`);
  agregarFiltroTexto(request, condiciones, 'FILTRORESPONSABLES', filtros.responsables, `CONCAT(ISNULL(U.NOMBRE, ''), ' ', ISNULL(US.NOMBRE, ''))`);

  return condiciones;
};

const listarSolicitudes = async (parametros) => {
  const pool = await conexion();
  const pagina = Math.max(1, parametros.pagina);
  const limite = Math.min(100, Math.max(1, parametros.limite));
  const offset = (pagina - 1) * limite;

  const requestDatos = pool.request();
  const condiciones = prepararConsultaListado(requestDatos, parametros);
  requestDatos.input('OFFSET', sql.Int, offset).input('LIMITE', sql.Int, limite);

  const resultado = await requestDatos.query(`
    ${seleccionSolicitud}
    WHERE ${condiciones.join(' AND ')}
    ORDER BY T.ID DESC
    OFFSET @OFFSET ROWS FETCH NEXT @LIMITE ROWS ONLY
  `);

  const requestTotal = pool.request();
  const condicionesTotal = prepararConsultaListado(requestTotal, parametros);
  const totalResultado = await requestTotal.query(`
    SELECT COUNT_BIG(1) AS TOTAL
    FROM TICKETSMESA T
    LEFT JOIN INCIDENTESMESA I ON T.IDINCIDENTE = I.ID
    LEFT JOIN AREASCLB A ON T.IDAREA = A.ID
    LEFT JOIN SEDESCLB SD ON T.IDSEDE = SD.ID
    LEFT JOIN USUARIOSMESA U ON T.IDUSUARIO = U.ID
    LEFT JOIN SOPORTESMESA S ON T.IDSOPORTE = S.ID
    LEFT JOIN USUARIOSMESA US ON S.IDUSUARIO = US.ID
    WHERE ${condicionesTotal.join(' AND ')}
  `);

  const total = Number(totalResultado.recordset[0]?.TOTAL || 0);
  return {
    datos: resultado.recordset,
    paginacion: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite)
    }
  };
};

const obtenerResumenSolicitudes = async ({ idUsuario, idMesa }) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDUSUARIO', sql.Int, idUsuario)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      WITH ESTADOS AS (
        SELECT 1 AS ID, 'POR ASIGNAR' AS ESTADO
        UNION ALL SELECT 2, 'EN PROCESO'
        UNION ALL SELECT 3, 'SOLUCIONADO'
      )
      SELECT E.ESTADO, COUNT(T.ID) AS TOTAL
      FROM ESTADOS E
      LEFT JOIN TICKETSMESA T
        ON T.ESTADO = E.ID
       AND T.IDUSUARIO = @IDUSUARIO
       AND T.IDMESA = @IDMESA
      GROUP BY E.ID, E.ESTADO

      UNION ALL

      SELECT 'TOTAL GENERAL', COUNT_BIG(1)
      FROM TICKETSMESA
      WHERE IDUSUARIO = @IDUSUARIO
        AND IDMESA = @IDMESA;
    `);
  return resultado.recordset;
};

const obtenerSolicitud = async ({ id, idUsuario, idMesa }) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('ID', sql.Int, id)
    .input('IDUSUARIO', sql.Int, idUsuario)
    .input('IDMESA', sql.Int, idMesa)
    .query(`${seleccionSolicitud}
      WHERE T.ID = @ID
        AND T.IDUSUARIO = @IDUSUARIO
        AND T.IDMESA = @IDMESA
    `);
  return resultado.recordset[0] || null;
};

const crearSolicitud = async (datos) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDINCIDENTE', sql.Int, Number(datos.incidente))
    .input('IDAREA', sql.Int, Number(datos.area))
    .input('IDSEDE', sql.Int, Number(datos.sede))
    .input('PRIORIDAD', sql.VarChar(30), aMayusculas(datos.prioridad))
    .input('DESCRIPCION', sql.VarChar(999), aMayusculas(datos.descripcion))
    .input('UBICACION', sql.VarChar(500), aMayusculas(datos.ubicacion))
    .input('DIRECCION', sql.VarChar(100), datos.direccion || null)
    .input('IDUSUARIO', sql.Int, datos.idUsuario)
    .input('IDMESA', sql.Int, datos.idMesa)
    .input('ARCHIVO', sql.VarChar(1000), datos.archivoUrl)
    .query(`
      INSERT INTO TICKETSMESA (
        IDINCIDENTE, IDAREA, IDSEDE, PRIORIDAD, DESCRIPCION,
        UBICACIONFISICA, ESTADO, DIRIP, IDUSUARIO, IDMESA, ARCHIVO_URL
      )
      OUTPUT INSERTED.*
      VALUES (
        @IDINCIDENTE, @IDAREA, @IDSEDE, @PRIORIDAD, @DESCRIPCION,
        @UBICACION, 1, @DIRECCION, @IDUSUARIO, @IDMESA, @ARCHIVO
      )
    `);
  return resultado.recordset[0];
};

const actualizarSolicitud = async (datos) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('ID', sql.Int, datos.id)
    .input('IDUSUARIO', sql.Int, datos.idUsuario)
    .input('IDMESA', sql.Int, datos.idMesa)
    .input('IDINCIDENTE', sql.Int, Number(datos.incidente))
    .input('IDAREA', sql.Int, Number(datos.area))
    .input('IDSEDE', sql.Int, Number(datos.sede))
    .input('PRIORIDAD', sql.VarChar(30), aMayusculas(datos.prioridad))
    .input('DESCRIPCION', sql.VarChar(999), aMayusculas(datos.descripcion))
    .input('UBICACION', sql.VarChar(500), aMayusculas(datos.ubicacion))
    .query(`
      UPDATE TICKETSMESA
      SET IDINCIDENTE = @IDINCIDENTE, IDAREA = @IDAREA, IDSEDE = @IDSEDE,
          PRIORIDAD = @PRIORIDAD, DESCRIPCION = @DESCRIPCION,
          UBICACIONFISICA = @UBICACION
      OUTPUT INSERTED.*
      WHERE ID = @ID
        AND IDUSUARIO = @IDUSUARIO
        AND IDMESA = @IDMESA
        AND ESTADO = 1
    `);
  return resultado.recordset[0] || null;
};

const eliminarSolicitud = async ({ id, idUsuario, idMesa }) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('ID', sql.Int, id)
    .input('IDUSUARIO', sql.Int, idUsuario)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      DELETE FROM TICKETSMESA
      WHERE ID = @ID
        AND IDUSUARIO = @IDUSUARIO
        AND IDMESA = @IDMESA
        AND ESTADO = 1
    `);
  return resultado.rowsAffected[0] > 0;
};

module.exports = {
  listarSolicitudes,
  obtenerResumenSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  actualizarSolicitud,
  eliminarSolicitud
};
