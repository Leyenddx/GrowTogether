const db = require('../config/db');

// Función 1: Obtener todas las vacantes activas (La que ya tenías)
const obtenerVacantes = async (req, res) => {
    try {
        const [vacantes] = await db.query('SELECT * FROM vacantes WHERE estado_activa = TRUE');
        res.status(200).json({ exito: true, total: vacantes.length, data: vacantes });
    } catch (error) {
        console.error('Error al obtener vacantes:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Función 2: ¡NUEVA! Guardar la postulación de un empleado
const postularVacante = async (req, res) => {
    const { usuario_id, vacante_id } = req.body;

    try {
        // 1. Verificamos si el usuario ya aplicó a esta vacante antes para no duplicar
        const [existe] = await db.query(
            'SELECT * FROM postulaciones WHERE usuario_id = ? AND vacante_id = ?', 
            [usuario_id, vacante_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ exito: false, mensaje: 'Ya te has postulado a esta vacante anteriormente.' });
        }

        // 2. Si no ha aplicado, lo registramos con la fecha de hoy
        await db.query(
            'INSERT INTO postulaciones (usuario_id, vacante_id, fecha, estado_postulacion) VALUES (?, ?, CURDATE(), "En Revisión")',
            [usuario_id, vacante_id]
        );

        res.status(200).json({ exito: true, mensaje: '¡Postulación enviada con éxito!' });
    } catch (error) {
        console.error('Error al postularse:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar la postulación' });
    }
};

// Función 3: ¡NUEVA! Crear una vacante (Solo para Admin/Supervisor)
const publicarVacante = async (req, res) => {
    const { titulo, descripcion } = req.body;

    try {
        await db.query(
            'INSERT INTO vacantes (titulo, descripcion, estado_activa) VALUES (?, ?, TRUE)',
            [titulo, descripcion]
        );
        res.status(200).json({ exito: true, mensaje: '¡Nueva vacante publicada con éxito!' });
    } catch (error) {
        console.error('Error al publicar vacante:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al guardar la vacante' });
    }
};

// Exportamos ambas funciones
module.exports = { obtenerVacantes, postularVacante, publicarVacante };