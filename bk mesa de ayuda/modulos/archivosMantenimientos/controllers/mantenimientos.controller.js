// const sql = require('mssql');
// const pool = require('../../../config/db');

// const crearArchivoMantenimiento = async (req, res) => {

//     try {

//         const{
//             IDMANTENIMIENTO,
//             NOMBREARCHIVO,
//             TIPOARCHIVO
//         } = req.body;

//         let urlMantenimiento = null;

//         if (req.file) {
//             urlMantenimiento = `/uploads/mantenimientos/${req.file.filename}`;
//         }

//         const conexion = await pool;

//         const resultado = await conexion
//         .request()
//         .input('IDMANTENIMIENTO', sql.Int, IDMANTENIMIENTO)
//         .input('NOMBREARCHIVO', sql.VarChar(255), NOMBREARCHIVO)
//         .input('URLARCHIVO', sql.VarChar(255), urlMantenimiento)
//         .input('TIPOARCHIVO', sql.VarChar(50), TIPOARCHIVO)
//         .query(`
//                 INSERT INTO MANTENIMIENTOSMESA
//                 (
//                     IDMANTENIMIENTO,
//                     NOMBREARCHIVO,
//                     URLARCHIVO,
//                     TIPOARCHIVO,
//                     FECHAREGISTRO
//                 )
//                 VALUES
//                 (
//                     @IDMANTENIMIENTO,
//                     @NOMBREARCHIVO,
//                     @URLARCHIVO,
//                     @TIPOARCHIVO,
//                     GETDATE()
//                 )
//             `)
//             res.status(201).json({ 
//                 ok: true,
//                 message: 'Mantenimiento creado exitosamente',
//                 mantenimiento: resultado.recordset[0],
//                 archivo:urlMantenimiento
//             });

//     }catch (error) {
//         console.error('Error al crear del archivo:', error);
//         res.status(500).json({ 
//             ok: false,
//             message: 'Error al crear del archivo',
//             error: error.message
//         });
//     }    

// }

// module.exports = {
//     crearArchivoMantenimiento
// }
