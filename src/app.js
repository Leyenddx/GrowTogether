const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Importar la conexión a MySQL

// Inicializar la aplicación
const app = express();
const PORT = 3000;

// Middlewares básicos (Para que entienda formato JSON y permita conexiones externas)
app.use(cors());
app.use(express.json());
// Exponer la carpeta de imágenes para que sean visibles en la web
app.use('/uploads', express.static('uploads'));

// Ruta de prueba (Endpoint principal)
app.get('/', (req, res) => {
    res.send('🚀 API de Gestión de Talento ECI funcionando al 100%');
});

// Importar rutas
const vacantesRoutes = require('./routes/vacantesRoutes');

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const tramitesRoutes = require('./routes/tramitesRoutes');
app.use('/api/tramites', tramitesRoutes);

const noticiasRoutes = require('./routes/noticiasRoutes');
app.use('/api/noticias', noticiasRoutes);


const empleadoRoutes = require('./routes/empleadoRoutes');
app.use('/api/empleado', empleadoRoutes);

// Usar rutas (El prefijo será /api/vacantes)
app.use('/api/vacantes', vacantesRoutes);

// Encender el motor
app.listen(PORT, () => {
    console.log(`Servidor de desarrollo encendido en http://localhost:${PORT}`);
});