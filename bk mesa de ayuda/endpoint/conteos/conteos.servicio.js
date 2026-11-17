const sql = require('mssql');
const { conexion } = require('../../config/db')


/*
==================================================
INDICE
==================================================

1. LOSCONTEOSPORUSUARIO
2. LOSCONTEOSPORSOPORTE
3. CONTEODEDIFERENCIAPORTIEMPO
4. LOSCONTEOSINDIVIDUALPORSOPORTE

==================================================
*/


//1. LOSCONTEOSPORUSUARIO
const losConteoPorUsuairo = async (req) => {


  const pool = await conexion();


  const { id, mesa } = req.params;


  const query = `
                SELECT 


                    E.ESTADO,
                    ISNULL(COUNT(T.ESTADO),0) AS TOTAL


                FROM (


                    SELECT 1 AS ID, 'POR ASIGNAR' AS ESTADO


                    UNION ALL


                    SELECT 2, 'EN PROCESO'


                    UNION ALL


                    SELECT 3, 'SOLUCIONADO'


                ) E

                LEFT JOIN TICKETSMESA T 


                    ON T.ESTADO = E.ID
                    AND T.IDUSUARIO = @id
                    AND T.IDMESA = @mesa


                GROUP BY E.ID, E.ESTADO


                UNION ALL


                SELECT 


                    'TOTAL GENERAL',
                    COUNT(*)


                FROM TICKETSMESA

                WHERE IDUSUARIO = @id AND IDMESA = @mesa
                `
  const resultado = await pool.request()
    .input("id", sql.Int, id)
    .input("mesa", sql.Int, mesa)
    .query(query);

  return resultado.recordset;


};


//2. LOSCONTEOSPORSOPORTE
const losConteos = async (req) => {


  const pool = await conexion();


  const { id_rol, mesa, id_soporte } = req.params;
  const { admin } = req.query;


  console.log('admin', admin)


  let where = `WHERE T.IDMESA = @mesa`;

  if (Number(admin) === 2 ) {

    where += ` AND T.IDSOPORTE = @id_soporte`;

  }

  const query = `        
                  SELECT 
                  CASE T.ESTADO

                    WHEN 1 THEN 'PENDIENTE'
                    WHEN 2 THEN 'EN PROCESO'
                    WHEN 3 THEN 'SOLUCIONADO'
                    ELSE 'SIN ESTADO'
                    END AS ESTADO,

                    COUNT(*) AS TOTAL

                  FROM TICKETSMESA T

                  ${where}

                  GROUP BY T.ESTADO


                  UNION ALL


                  SELECT 

                      'TOTAL GENERAL' AS ESTADO,

                      COUNT(*) AS TOTAL

                  FROM TICKETSMESA T

                  ${where}
        `


  const resultado = await pool.request()
    .input("id_rol", sql.Int, id_rol)
    .input("mesa", sql.Int, mesa)
    .input("id_soporte", sql.Int, id_soporte)
    .query(query)
console.log(query)

  return resultado.recordset


}


//3. CONTEODEDIFERENCIAPORTIEMPO
const lasDiferencia = async () => {


  const pool = await conexion()


  const query = `
                SELECT 

                *,
                DATEDIFF(MINUTE,HORAREGISTRO,HORACIERRE) AS HORA_DIFF

                FROM TICKETSMESA

                WHERE ID >= 299
                `


  const resulta = await pool.request()
    .query(query)


  return resulta.recordset;


}


const consultarAgrupacionesPanel = async (idMesa) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDMESA', sql.Int, Number(idMesa))
    .query(`
      SELECT TOP 10COALESCE(A.NOMBRE, 'SIN AREA') AS NOMBRE, COUNT(T.ID) AS TOTAL
      FROM TICKETSMESA T
      LEFT JOIN AREASCLB A ON A.ID = T.IDAREA
      WHERE T.IDMESA = @IDMESA
      GROUP BY A.ID, A.NOMBRE
      ORDER BY TOTAL DESC, NOMBRE ASC;

      SELECT COALESCE(S.NOMBRE, 'SIN SEDE') AS NOMBRE, COUNT(T.ID) AS TOTAL
      FROM TICKETSMESA T
      LEFT JOIN SEDESCLB S ON S.ID = T.IDSEDE
      WHERE T.IDMESA = @IDMESA
      GROUP BY S.ID, S.NOMBRE
      ORDER BY TOTAL DESC, NOMBRE ASC;
    `);
  return { areas: resultado.recordsets[0] || [], sedes: resultado.recordsets[1] || [] };
};

const resumenTicketsMesa = async (idMesa) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDMESA', sql.Int, idMesa)
    .query(`
      SELECT estados.ESTADO, COUNT(tickets.ID) AS TOTAL
      FROM (
        SELECT 1 AS ID, 'POR ASIGNAR' AS ESTADO
        UNION ALL SELECT 2, 'EN PROCESO'
        UNION ALL SELECT 3, 'SOLUCIONADO'
      ) estados
      LEFT JOIN TICKETSMESA tickets
        ON tickets.ESTADO = estados.ID
       AND tickets.IDMESA = @IDMESA
      GROUP BY estados.ID, estados.ESTADO

      UNION ALL

      SELECT 'TOTAL GENERAL', COUNT(*)
      FROM TICKETSMESA
      WHERE IDMESA = @IDMESA;
    `);
  return resultado.recordset;
};

//4. LOSCONTEOSINDIVIDUALPORSOPORTE
const losConteosDeTickets = async (req, res) => {


  const pool = await conexion();


  const { mesa } = req.params


  const query = `
                SELECT
                  COALESCE(U.NOMBRE, 'SIN ASIGNAR') AS IDSOPORTE,
                  COUNT(T.ID) AS TOTAL
                FROM TICKETSMESA T
                LEFT JOIN SOPORTESMESA S
                  ON S.ID = T.IDSOPORTE
                 AND S.IDMESA = T.IDMESA
                LEFT JOIN USUARIOSMESA U
                  ON U.ID = S.IDUSUARIO
                WHERE T.IDMESA = @mesa
                GROUP BY S.ID, U.NOMBRE
                ORDER BY TOTAL DESC, IDSOPORTE ASC
                `


  const resultado = await pool.request()
    .input('mesa', sql.Int, Number(mesa))
    .query(query)


  return resultado.recordset;


}


module.exports = {

  losConteos,
  losConteoPorUsuairo,
  resumenTicketsMesa,
  losConteosDeTickets,
  lasDiferencia,
  consultarAgrupacionesPanel

}
