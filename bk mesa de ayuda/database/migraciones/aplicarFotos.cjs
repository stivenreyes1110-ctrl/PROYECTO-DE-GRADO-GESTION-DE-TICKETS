const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({path: path.resolve(__dirname, '../../.env'), quiet: true});
const {conexion} = require('../../config/db');
async function aplicar() {
  let pool;
  try {
    pool = await conexion();
    const migracion = await fs.readFile(path.join(__dirname, '20261005_fotos_inventario_mantenimiento.sql'), 'utf8');
    await pool.request().batch(migracion);
    console.log('Columnas FOTO y EVIDENCIA preparadas: guardan la ruta /uploads/activos/ del archivo.');
  } catch (error) {
    console.error('No se pudo aplicar la migracion de fotos:', error.code || error.name);
    process.exitCode = 1;
  } finally { if (pool) await pool.close(); }
}
aplicar();
