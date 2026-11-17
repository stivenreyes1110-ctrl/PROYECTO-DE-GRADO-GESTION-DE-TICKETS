const sql = require('mssql');
const { conexion } = require('../../config/db');


/*
==================================================
INDICE
==================================================

1. LOSUSUARIOS
2. LOSSOPORTES

==================================================
*/


// 1. LOSUSUARIOS
const losUsuarios = async () => {

    
    const pool = await conexion();


    const query =`
                    SELECT 
                        U.ID AS IDUSUARIO,
                        U.NOMBRE,
                        U.USUARIO,
                        U.ESTADO,
                        U.IDROL,
                        S.ID AS IDSOPORTE,
                        S.IDMESA


                    FROM USUARIOSMESA U


                    LEFT JOIN SOPORTESMESA S


                     ON U.ID = S.IDUSUARIO;
                `


    console.log('-- CONSULTA DE USUARIOS');


    const resultado = await pool.query(query);


    return resultado.recordset;


};



    // 2. LOSSOPORTES
    const losSoportes = async (mesa) => {

        
        const pool = await conexion();


        const query =`
                        SELECT 
                            S.ID AS IDSOPORTE,
                            S.IDMESA,
                            U.ID AS IDUSUARIO,
                            U.NOMBRE,
                            U.USUARIO,
                            U.ESTADO,
                            U.IDROL,
                            S.IDROL AS IDROL_MESA


                        FROM SOPORTESMESA S


                        INNER JOIN USUARIOSMESA U


                        ON S.IDUSUARIO = U.ID


                        WHERE S.IDROL IN (1, 2)
                          AND U.ESTADO = 1
                          AND S.IDMESA = @mesa
                        ORDER BY U.NOMBRE;
                    `


        console.log('-- CONSULTA DE SOPORTES');
        

        const resultado = await pool.request()
        .input('mesa',sql.Int,Number(mesa))
        .query(query)


        return resultado.recordset;


    };

const consultarUsuariosPorMesa = async (mesa) => {
    const pool = await conexion();
    const resultado = await pool.request()
    .input('mesa', sql.Int, Number(mesa))
    .query(`
        SELECT U.ID AS IDUSUARIO, U.NOMBRE, U.USUARIO, U.ESTADO,
               S.ID AS IDSOPORTE, S.IDMESA, COALESCE(S.IDROL, 3) AS IDROL,
               CASE COALESCE(S.IDROL, 3)
                 WHEN 1 THEN 'ADMINISTRADOR'
                 WHEN 2 THEN 'SOPORTE'
                 ELSE 'USUARIO'
               END AS ROL
        FROM USUARIOSMESA U
        LEFT JOIN SOPORTESMESA S
          ON S.IDUSUARIO = U.ID AND S.IDMESA = @mesa
        WHERE U.ESTADO = 1
        ORDER BY U.NOMBRE, U.USUARIO;
    `);
    return resultado.recordset;
};

const convertirUsuarioEnSoporte = async (idUsuario, mesa) => {
    const pool = await conexion();
    const transaccion = new sql.Transaction(pool);
    await transaccion.begin();
    try {
        const request = new sql.Request(transaccion);
        request.input('IDUSUARIO', sql.Int, Number(idUsuario));
        request.input('IDMESA', sql.Int, Number(mesa));
        const resultado = await request.query(`
            IF NOT EXISTS (SELECT 1 FROM USUARIOSMESA WHERE ID = @IDUSUARIO AND ESTADO = 1)
                THROW 50002, 'Usuario no encontrado o inactivo', 1;

            UPDATE SOPORTESMESA WITH (UPDLOCK, HOLDLOCK)
            SET IDROL = CASE WHEN IDROL = 1 THEN 1 ELSE 2 END
            WHERE IDUSUARIO = @IDUSUARIO AND IDMESA = @IDMESA;

            IF @@ROWCOUNT = 0
                INSERT INTO SOPORTESMESA (IDUSUARIO, IDMESA, IDROL)
                VALUES (@IDUSUARIO, @IDMESA, 2);

            SELECT U.ID AS IDUSUARIO, U.NOMBRE, U.USUARIO, U.ESTADO,
                   S.ID AS IDSOPORTE, S.IDMESA, S.IDROL,
                   CASE S.IDROL WHEN 1 THEN 'ADMINISTRADOR' ELSE 'SOPORTE' END AS ROL
            FROM USUARIOSMESA U
            INNER JOIN SOPORTESMESA S
              ON S.IDUSUARIO = U.ID AND S.IDMESA = @IDMESA
            WHERE U.ID = @IDUSUARIO;
        `);
        await transaccion.commit();
        return resultado.recordset[0];
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
};

const asignarRolUsuario = async (idUsuario, idRol, mesa, idActor) => {
    const pool = await conexion();
    const transaccion = new sql.Transaction(pool);
    await transaccion.begin();
    try {
        const request = new sql.Request(transaccion);
        request.input('IDUSUARIO', sql.Int, Number(idUsuario));
        request.input('IDROL', sql.Int, Number(idRol));
        request.input('IDMESA', sql.Int, Number(mesa));
        request.input('IDACTOR', sql.Int, Number(idActor));
        const resultado = await request.query(`
            IF @IDUSUARIO = @IDACTOR
                THROW 50003, 'No puede cambiar su propio rol', 1;
            IF NOT EXISTS (SELECT 1 FROM USUARIOSMESA WHERE ID = @IDUSUARIO AND ESTADO = 1)
                THROW 50002, 'Usuario no encontrado o inactivo', 1;
            IF @IDROL NOT IN (1, 2)
                THROW 50005, 'Rol no válido', 1;

            IF @IDROL <> 1
               AND EXISTS (SELECT 1 FROM SOPORTESMESA WHERE IDUSUARIO = @IDUSUARIO AND IDMESA = @IDMESA AND IDROL = 1)
               AND (SELECT COUNT(*) FROM SOPORTESMESA WHERE IDMESA = @IDMESA AND IDROL = 1) <= 1
                THROW 50004, 'La mesa debe conservar al menos un administrador', 1;

            UPDATE SOPORTESMESA WITH (UPDLOCK, HOLDLOCK)
            SET IDROL = @IDROL
            WHERE IDUSUARIO = @IDUSUARIO AND IDMESA = @IDMESA;
            IF @@ROWCOUNT = 0
                INSERT INTO SOPORTESMESA (IDUSUARIO, IDMESA, IDROL)
                VALUES (@IDUSUARIO, @IDMESA, @IDROL);

            SELECT U.ID AS IDUSUARIO, U.NOMBRE, U.USUARIO, U.ESTADO,
                   S.ID AS IDSOPORTE, S.IDMESA, COALESCE(S.IDROL, 3) AS IDROL,
                   CASE COALESCE(S.IDROL, 3)
                     WHEN 1 THEN 'ADMINISTRADOR' WHEN 2 THEN 'SOPORTE' ELSE 'USUARIO'
                   END AS ROL
            FROM USUARIOSMESA U
            LEFT JOIN SOPORTESMESA S ON S.IDUSUARIO = U.ID AND S.IDMESA = @IDMESA
            WHERE U.ID = @IDUSUARIO;
        `);
        await transaccion.commit();
        return resultado.recordset[0];
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
};

module.exports = {


    losUsuarios,
    losSoportes,
    consultarUsuariosPorMesa,
    convertirUsuarioEnSoporte,
    asignarRolUsuario

    
};
