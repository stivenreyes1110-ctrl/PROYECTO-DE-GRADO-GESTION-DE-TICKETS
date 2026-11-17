const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: 'MESAAYUDADB80',
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function conexion() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error.message);
    throw error;
  }
}

module.exports = {
  conexion
};
