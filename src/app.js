const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('🚀 API de Gestión de Talento ECI funcionando al 100%');
});

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

app.use('/api/vacantes', vacantesRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de desarrollo encendido en http://localhost:${PORT}`);
});