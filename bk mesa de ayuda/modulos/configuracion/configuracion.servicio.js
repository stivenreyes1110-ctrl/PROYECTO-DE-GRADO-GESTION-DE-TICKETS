const sql = require('mssql');
const {conexion} = require('../../config/db');
const {RECURSOS} = require('./configuracion.validacion');
const {columnasDependencias, describirRegistro} = require('./configuracion.dependencias');
async function esAdministrador(usuario) {
  if (Number(usuario?.idRol) !== 1) return false;
  const pool = await conexion();
  const r = await pool.request().input('IDUSUARIO', sql.Int, Number(usuario.idUsuario)).input('IDMESA', sql.Int, Number(usuario.idMesa)).query(`
    SELECT TOP (1) S.ID FROM SOPORTESMESA S INNER JOIN USUARIOSMESA U ON U.ID = S.IDUSUARIO
    WHERE S.IDUSUARIO = @IDUSUARIO AND S.IDMESA = @IDMESA AND S.IDROL = 1 AND U.ESTADO = 1;
  `);
  return r.recordset.length > 0;
}
async function listar(recurso, mesa) {
  if (!Object.hasOwn(RECURSOS,recurso)) throw new Error('Recurso no permitido');
  const pool = await conexion();
  const request = pool.request().input('IDMESA', sql.Int, mesa);
  const consultas = {
    incidentes: `SELECT C.*, ${columnasDependencias('incidentes')} FROM INCIDENTESMESA C WHERE C.IDMESA=@IDMESA OR C.IDMESA IS NULL ORDER BY C.NOMBRE`,
    sedes: `SELECT C.*, ${columnasDependencias('sedes')} FROM SEDESCLB C ORDER BY C.NOMBRE`,
    areas: `SELECT C.*, S.NOMBRE AS SEDE, ${columnasDependencias('areas')} FROM AREASCLB C JOIN SEDESCLB S ON S.ID=C.IDSEDE ORDER BY S.NOMBRE,C.NOMBRE`,
    prioridades: `SELECT C.*, ${columnasDependencias('prioridades')} FROM PRIORIDADESMESA C WHERE C.IDMESA=@IDMESA ORDER BY C.ORDEN,C.NOMBRE`
  };
  return (await request.query(consultas[recurso])).recordset.map(r => describirRegistro(recurso,r,mesa));
}
function solicitud(pool, datos, mesa, id) {
  return new sql.Request(pool).input('ID', sql.Int, id || null).input('IDMESA', sql.Int, mesa)
    .input('NOMBRE', sql.VarChar(100), datos.NOMBRE || null)
    .input('IDSEDE', sql.Int, datos.IDSEDE || null).input('PISO', sql.Int, datos.PISO ?? null)
    .input('CODIGO', sql.VarChar(20), datos.CODIGO || null).input('ORDEN', sql.Int, datos.ORDEN ?? 0);
}
async function guardar(recurso, datos, mesa, id = null) {
  const config = RECURSOS[recurso];
  if (!config) throw new Error('Recurso no permitido');
  const pool = await conexion();
  const transaccion = new sql.Transaction(pool);
  await transaccion.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const alcance = config.mesa ? ' AND IDMESA=@IDMESA' : '';
    const guardas = `${id ? `IF NOT EXISTS (SELECT 1 FROM ${config.tabla} WHERE ID=@ID${alcance}) THROW 50104, 'Registro no encontrado en esta mesa.', 1;` : ''}
      ${recurso === 'areas' ? `IF NOT EXISTS (SELECT 1 FROM SEDESCLB WHERE ID=@IDSEDE) THROW 50100, 'La sede no existe.', 1;
        IF @ID IS NOT NULL AND EXISTS (SELECT 1 FROM AREASCLB WHERE ID=@ID AND IDSEDE<>@IDSEDE)
          AND (EXISTS (SELECT 1 FROM TICKETSMESA WHERE IDAREA=@ID) OR EXISTS (SELECT 1 FROM INVENTARIOSMESA WHERE IDAREA=@ID))
          THROW 50109, 'No se puede cambiar la sede de un area usada en tickets o inventario.', 1;` : ''}
      ${recurso === 'prioridades' && id ? `IF EXISTS (SELECT 1 FROM PRIORIDADESMESA P JOIN TICKETSMESA T ON T.PRIORIDAD=P.CODIGO AND T.IDMESA=P.IDMESA WHERE P.ID=@ID AND P.CODIGO<>@CODIGO)
        THROW 50109, 'La prioridad esta en uso. Puedes editar su nombre y orden, pero no su codigo.', 1;` : ''}
      IF EXISTS (SELECT 1 FROM ${config.tabla} WHERE ${recurso === 'prioridades' ? 'CODIGO=@CODIGO' : 'NOMBRE=@NOMBRE'} AND (@ID IS NULL OR ID<>@ID)
        ${recurso === 'areas' ? 'AND IDSEDE=@IDSEDE' : config.mesa ? 'AND (IDMESA=@IDMESA OR IDMESA IS NULL)' : ''})
        THROW 50109, 'Ya existe un registro con ese nombre o codigo.', 1;
    `;
    const columnas = recurso === 'areas' ? 'NOMBRE, IDSEDE, PISO' : recurso === 'prioridades' ? 'NOMBRE, CODIGO, ORDEN, IDMESA' : recurso === 'incidentes' ? 'NOMBRE, IDMESA' : 'NOMBRE';
    const valores = columnas.split(', ').map(col => '@'+col).join(', ');
    const campos = columnas.split(', ').filter(col => col !== 'IDMESA').map(col => `${col}=@${col}`).join(', ');
    const consulta = `${guardas}
${id ? `UPDATE ${config.tabla} SET ${campos} OUTPUT INSERTED.* WHERE ID=@ID${alcance}` : `INSERT INTO ${config.tabla} (${columnas}) OUTPUT INSERTED.* VALUES (${valores})`};`;
    const result = await solicitud(transaccion, datos, mesa, id).query(consulta);
    await transaccion.commit();
    return result.recordset[0];
  } catch (error) {await transaccion.rollback();throw error;}
}
async function eliminar(recurso, id, mesa) {
  if (!Object.hasOwn(RECURSOS,recurso)) throw new Error('Recurso no permitido');
  const config = RECURSOS[recurso];
  const pool = await conexion();
  const tx = new sql.Transaction(pool);
  await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const alcance = config.mesa ? ' AND C.IDMESA=@IDMESA' : '';
    // La lectura bloquea el registro y sus dependencias hasta terminar el borrado.
    const resultado = await solicitud(tx,{},mesa,id).query(`
      SELECT C.*, ${columnasDependencias(recurso)}
      FROM ${config.tabla} C WITH (UPDLOCK,HOLDLOCK)
      WHERE C.ID=@ID${alcance};
    `);
    const registro = resultado.recordset[0];
    if (!registro) throw Object.assign(new Error('Registro no encontrado en esta mesa.'),{number:50104});
    const estado = describirRegistro(recurso,registro,mesa);
    if (!estado.PUEDE_ELIMINAR) throw Object.assign(new Error(`No se puede eliminar el registro. ${estado.MOTIVO_ELIMINACION}`),{number:50109});
    await solicitud(tx,{},mesa,id).query(`DELETE FROM ${config.tabla} WHERE ID=@ID${config.mesa ? ' AND IDMESA=@IDMESA' : ''};`);
    await tx.commit();
  } catch(error) {await tx.rollback();throw error;}
}
async function prioridadDisponible(mesa, codigo) {
  const pool = await conexion();
  const r = await pool.request().input('IDMESA', sql.Int, mesa).input('CODIGO', sql.VarChar(20), String(codigo).trim().toUpperCase())
    .query('SELECT ID FROM PRIORIDADESMESA WHERE IDMESA=@IDMESA AND CODIGO=@CODIGO');
  return r.recordset.length > 0;
}
module.exports = {esAdministrador, listar, guardar, eliminar, prioridadDisponible};
