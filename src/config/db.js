const mysql = require('mysql2/promise');
require('dotenv').config(); // Esto lee tu archivo .env

// Crear un "Pool" de conexiones (mucho más rápido y seguro que una conexión simple)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión justo al iniciar
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión exitosa a la base de datos MySQL (talento_eci)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    });

module.exports = pool;