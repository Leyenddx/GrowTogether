const db = require('../config/db');

const obtenerMisSolicitudes = async (req, res) => {
    const { id_empleado } = req.params;
    try {
        const [usuario] = await db.query('SELECT dias_vacaciones FROM usuarios WHERE id_numero_empleado = ?', [id_empleado]);
        let diasBase = usuario[0] ? usuario[0].dias_vacaciones : 0;
        
        const [solicitudes] = await db.query('SELECT * FROM solicitudes_vacaciones WHERE usuario_id = ? ORDER BY fecha_inicio DESC', [id_empleado]);

        let diasGastados = 0;
        solicitudes.forEach(sol => {
            if (sol.estado_aprobacion === 'Aprobado' && sol.tipo_permiso === 'Vacaciones') {
                const fecha1 = new Date(sol.fecha_inicio);
                const fecha2 = new Date(sol.fecha_fin);
                // Calculamos la diferencia en días
                const diferenciaTiempo = Math.abs(fecha2 - fecha1);
                const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1; // +1 para contar el día de inicio y el de fin
                diasGastados += diferenciaDias;
            }
        });

        const diasDisponiblesReales = diasBase - diasGastados;

        res.status(200).json({ 
            exito: true, 
            diasDisponibles: diasDisponiblesReales, 
            historial: solicitudes 
        });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error del servidor' });
    }
};

const crearSolicitud = async (req, res) => {
    const { usuario_id, fecha_inicio, fecha_fin, tipo_permiso } = req.body;
    try {
        await db.query(
            'INSERT INTO solicitudes_vacaciones (usuario_id, fecha_inicio, fecha_fin, tipo_permiso, estado_aprobacion) VALUES (?, ?, ?, ?, "Pendiente")', 
            [usuario_id, fecha_inicio, fecha_fin, tipo_permiso]
        );
        res.status(200).json({ exito: true, mensaje: 'Solicitud enviada con éxito' });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al procesar trámite' });
    }
};

module.exports = { obtenerMisSolicitudes, crearSolicitud };