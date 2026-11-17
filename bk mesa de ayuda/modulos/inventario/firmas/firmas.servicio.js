const sql = require('mssql');
const {conexion} = require('../../../config/db');
function preparar(pool, id, usuario) {
  return new sql.Request(pool).input('IDACTIVO', sql.Int, id).input('IDMESA', sql.Int, Number(usuario.idMesa)).input('IDUSUARIO', sql.Int, Number(usuario.idUsuario));
}
function serializar(firma) {
  return {TIPO: firma.TIPO, NOMBRE: firma.NOMBRE, FECHAFIRMA: firma.FECHAFIRMA, IDUSUARIO: firma.IDUSUARIO, IDFIRMANTE: firma.IDFIRMANTE, FIRMA: `data:image/png;base64,${firma.IMAGEN.toString('base64')}`};
}
async function consultarFirmas(id, usuario) {
  const pool = await conexion();
  const r = await preparar(pool,id,usuario).query(`
    IF NOT EXISTS (SELECT 1 FROM INVENTARIOSMESA WHERE ID=@IDACTIVO AND IDMESA=@IDMESA)
      THROW 50204, 'Activo no encontrado en esta mesa.', 1;
    SELECT TIPO,NOMBRE,IMAGEN,FECHAFIRMA,IDUSUARIO,IDFIRMANTE FROM FIRMASHOJAVIDA WHERE IDACTIVO=@IDACTIVO;
  `);
  return r.recordset.map(serializar);
}
async function guardarFirma(id, tipo, datos, usuario) {
  const pool = await conexion();
  const tx = new sql.Transaction(pool);await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const r = await preparar(tx,id,usuario).input('TIPO',sql.VarChar(20),tipo).input('IDFIRMANTE',sql.Int,datos.idFirmante).input('IMAGEN',sql.VarBinary(sql.MAX),datos.imagen).query(`
      IF NOT EXISTS (SELECT 1 FROM SOPORTESMESA S JOIN USUARIOSMESA U ON U.ID=S.IDUSUARIO WHERE S.IDUSUARIO=@IDUSUARIO AND S.IDMESA=@IDMESA AND S.IDROL IN (1,2) AND U.ESTADO=1)
        THROW 50203, 'No tiene permisos para guardar firmas en esta mesa.', 1;
      IF NOT EXISTS (SELECT 1 FROM INVENTARIOSMESA WHERE ID=@IDACTIVO AND IDMESA=@IDMESA)
        THROW 50204, 'Activo no encontrado en esta mesa.', 1;
      DECLARE @NOMBRE NVARCHAR(100);
      SELECT @NOMBRE=NOMBRE FROM USUARIOSMESA WITH (UPDLOCK,HOLDLOCK) WHERE ID=@IDFIRMANTE AND ESTADO=1;
      IF @NOMBRE IS NULL THROW 50200, 'El firmante no existe o esta inactivo.', 1;
      UPDATE FIRMASHOJAVIDA SET IDFIRMANTE=@IDFIRMANTE, NOMBRE=@NOMBRE, IMAGEN=@IMAGEN, FECHAFIRMA=SYSUTCDATETIME(), IDUSUARIO=@IDUSUARIO WHERE IDACTIVO=@IDACTIVO AND TIPO=@TIPO;
      IF @@ROWCOUNT=0 INSERT INTO FIRMASHOJAVIDA (IDACTIVO,TIPO,NOMBRE,IMAGEN,IDUSUARIO,IDFIRMANTE) VALUES (@IDACTIVO,@TIPO,@NOMBRE,@IMAGEN,@IDUSUARIO,@IDFIRMANTE);
      SELECT TIPO,NOMBRE,IMAGEN,FECHAFIRMA,IDUSUARIO,IDFIRMANTE FROM FIRMASHOJAVIDA WHERE IDACTIVO=@IDACTIVO AND TIPO=@TIPO;
    `);
    await tx.commit();return serializar(r.recordset[0]);
  } catch(error) {await tx.rollback();throw error;}
}
async function consultarFirmantes(id, usuario) {
  const pool = await conexion();
  const r = await preparar(pool,id,usuario).query(`
    IF NOT EXISTS (SELECT 1 FROM INVENTARIOSMESA WHERE ID=@IDACTIVO AND IDMESA=@IDMESA)
      THROW 50204, 'Activo no encontrado en esta mesa.', 1;
    SELECT ID AS IDUSUARIO,NOMBRE,USUARIO FROM USUARIOSMESA WHERE ESTADO=1 ORDER BY NOMBRE,USUARIO;
  `);
  return r.recordset;
}
module.exports = {consultarFirmas, guardarFirma, consultarFirmantes};
