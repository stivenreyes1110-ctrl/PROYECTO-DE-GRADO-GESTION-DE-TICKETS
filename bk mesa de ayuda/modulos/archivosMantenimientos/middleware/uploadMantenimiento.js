// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadDir = path.join(
//     __dirname,
//     "..",
//     "uploads",
//     "mantenimientos"
// );

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },

//     filename: function (req, file, cb) {

//         const extension = path.extname(file.originalname);

//         const nombreArchivo = `Mantenimiento_${Date.now()}${extension}`;

//         cb(null, nombreArchivo);
//     }
// });

// const upload = multer({
//     storage: storage,
    
//     limits: {
//         fileSize: 10 * 1024 * 1024
//     },

//     fileFilter: function (req, file, cb){
//         const permitidos = [
//             "image/jpeg",
//             "image/png",
//             "application/pdf"
//         ];

//         if (permitidos.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error("Tipo de archivo no permitido"), false);
//         }
//     }

// });

// module.exports = upload;
