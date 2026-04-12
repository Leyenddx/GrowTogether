const db = require('../config/db');

const obtenerDashboardEmpleado = async (req, res) => {
    const { id } = req.params; // Recibimos la nómina del empleado (ej. Juan)

    try {
        // 1. Buscamos a su jefe (Por ahora tomaremos al primer Supervisor/Rol 2 que exista)
        const [jefe] = await db.query('SELECT nombre, correo FROM usuarios WHERE rol_id = 2 LIMIT 1');
        
        // 2. Buscamos la noticia más reciente
        const [noticia] = await db.query('SELECT * FROM noticias ORDER BY fecha_publicacion DESC LIMIT 1');
        
        // 3. Buscamos su última postulación a vacante
        const [postulacion] = await db.query(`
            SELECT p.estado_postulacion, v.titulo 
            FROM postulaciones p 
            JOIN vacantes v ON p.vacante_id = v.id 
            WHERE p.usuario_id = ? ORDER BY p.fecha DESC LIMIT 1
        `, [id]);

        // 4. Buscamos su última solicitud de vacaciones
        const [tramite] = await db.query(`
            SELECT tipo_permiso, estado_aprobacion 
            FROM solicitudes_vacaciones 
            WHERE usuario_id = ? ORDER BY fecha_inicio DESC LIMIT 1
        `, [id]);

        // Empaquetamos todo y lo enviamos
        res.status(200).json({
            exito: true,
            jefe: jefe[0] || null,
            noticia: noticia[0] || null,
            postulacion: postulacion[0] || null,
            tramite: tramite[0] || null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ exito: false, mensaje: 'Error al cargar el inicio' });
    }
};

module.exports = { obtenerDashboardEmpleado };