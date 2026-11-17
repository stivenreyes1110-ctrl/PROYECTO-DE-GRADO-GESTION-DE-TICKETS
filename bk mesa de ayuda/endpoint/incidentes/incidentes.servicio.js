const sql = require("mssql");


const { conexion } = require('../../config/db');


/*
==================================================
INDICE
==================================================

1. INCIDENTESPORMESA

==================================================
*/


//1. INCIDENTESPORMESA
const losIncidentes = async (mesa) => {


    const pool = await conexion();


    console.log('--SE HIZO UNA CONSULTA DE INCIDENTES')
    console.log(" ");
    console.log(" ");


    const resultado = await pool.request().input('IDMESA', sql.Int, Number(mesa)).query(
        `

        
        SELECT * FROM INCIDENTESMESA WHERE IDMESA = @IDMESA OR IDMESA IS NULL


        `
    )


    return resultado.recordset


}


module.exports = {


    losIncidentes


}
