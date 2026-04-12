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

// Función 2: Guardar la postulación de un empleado
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

// Función 3: ¡ACTUALIZADA! Crear una vacante con Planta, Turno, Fecha y Requisitos dinámicos
const publicarVacante = async (req, res) => {
    // Recibimos todos los datos nuevos y un arreglo de requisitos
    const { titulo, descripcion, planta, turno, fecha_limite, requisitos } = req.body;

    try {
        // 1. Insertamos la vacante principal
        const [resultado] = await db.query(
            'INSERT INTO vacantes (titulo, descripcion, planta, turno, fecha_limite, estado_activa, fecha_publicacion) VALUES (?, ?, ?, ?, ?, TRUE, CURDATE())',
            [titulo, descripcion, planta, turno, fecha_limite]
        );

        const nuevaVacanteId = resultado.insertId;

        // 2. Si Ana mandó requisitos, los guardamos uno por uno en su propia tabla
        if (requisitos && requisitos.length > 0) {
            for (let req of requisitos) {
                await db.query(
                    'INSERT INTO vacante_requisitos (vacante_id, requisito) VALUES (?, ?)',
                    [nuevaVacanteId, req]
                );
            }
        }

        res.status(200).json({ exito: true, mensaje: '¡Nueva vacante publicada con éxito!' });
    } catch (error) {
        console.error("Error al crear vacante:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al guardar la vacante' });
    }
};

// Función 4: Marcar vacante como completada (Cerrar vacante)
const cerrarVacante = async (req, res) => {
    const { id } = req.params;

    try {
        // Cambiamos el estado a FALSE para que ya no le salga a Juan
        await db.query('UPDATE vacantes SET estado_activa = FALSE WHERE id = ?', [id]);
        res.status(200).json({ exito: true, mensaje: 'Vacante cerrada con éxito. Ya no recibirá postulaciones.' });
    } catch (error) {
        console.error('Error al cerrar vacante:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno al cerrar la vacante' });
    }
};

// Función 5: Eliminar vacante definitivamente (Borrado en cascada manual)
const eliminarVacante = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Primero borramos a los "hijos" para evitar errores de Base de Datos
        await db.query('DELETE FROM vacante_requisitos WHERE vacante_id = ?', [id]);
        await db.query('DELETE FROM postulaciones WHERE vacante_id = ?', [id]);
        
        // 2. Ahora sí, borramos la vacante principal
        await db.query('DELETE FROM vacantes WHERE id = ?', [id]);

        res.status(200).json({ exito: true, mensaje: 'Vacante eliminada de la base de datos.' });
    } catch (error) {
        console.error('Error al eliminar vacante:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al intentar eliminar la vacante' });
    }
};

// ==========================================
// 📋 FUNCIONES DE GESTIÓN DE POSTULACIONES (NUEVO)
// ==========================================

// Función 6: Obtener postulaciones para el Supervisor (¡AHORA CON FILTRO!)
const obtenerPostulaciones = async (req, res) => {
    try {
        const [postulaciones] = await db.query(`
            SELECT p.id AS postulacion_id, p.fecha, p.estado_postulacion, 
                   v.titulo AS vacante_titulo, 
                   u.nombre AS empleado_nombre, u.id_numero_empleado
            FROM postulaciones p
            JOIN vacantes v ON p.vacante_id = v.id
            JOIN usuarios u ON p.usuario_id = u.id_numero_empleado
            WHERE p.estado_postulacion = 'En Revisión' 
            ORDER BY p.fecha DESC
        `);
        res.status(200).json({ exito: true, data: postulaciones });
    } catch (error) {
        console.error('Error al obtener postulaciones:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al cargar las postulaciones.' });
    }
};



// Función 7: Aprobar un candidato
const aprobarPostulacion = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE postulaciones SET estado_postulacion = "Aprobado" WHERE id = ?', [id]);
        res.status(200).json({ exito: true, mensaje: 'Candidato Aprobado exitosamente. 🎉' });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al aprobar candidato.' });
    }
};

// Función 8: Rechazar un candidato
const rechazarPostulacion = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE postulaciones SET estado_postulacion = "Rechazado" WHERE id = ?', [id]);
        res.status(200).json({ exito: true, mensaje: 'Candidato Rechazado.' });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al rechazar candidato.' });
    }
};

// Función NUEVA: Para que Juan vea sus propios procesos
const obtenerMisPostulaciones = async (req, res) => {
    const { id_empleado } = req.params;
    try {
        const [misPostulaciones] = await db.query(`
            SELECT p.fecha, p.estado_postulacion, v.titulo, v.planta
            FROM postulaciones p
            JOIN vacantes v ON p.vacante_id = v.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha DESC
        `, [id_empleado]);
        res.status(200).json({ exito: true, data: misPostulaciones });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener tu historial.' });
    }
};


module.exports = { 
    obtenerVacantes, 
    postularVacante, 
    publicarVacante, 
    cerrarVacante, 
    eliminarVacante,
    obtenerPostulaciones,
    aprobarPostulacion,
    rechazarPostulacion,
    obtenerMisPostulaciones // <--- ¡Añadimos la de Juan aquí!
};