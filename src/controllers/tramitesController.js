const db = require('../config/db');

// 1. Obtener los días disponibles reales y el historial
const obtenerMisSolicitudes = async (req, res) => {
    const { id_empleado } = req.params;
    try {
        // Buscamos sus días base
        const [usuario] = await db.query('SELECT dias_vacaciones FROM usuarios WHERE id_numero_empleado = ?', [id_empleado]);
        let diasBase = usuario[0] ? usuario[0].dias_vacaciones : 0;
        
        // Buscamos su historial de solicitudes
        const [solicitudes] = await db.query('SELECT * FROM solicitudes_vacaciones WHERE usuario_id = ? ORDER BY fecha_inicio DESC', [id_empleado]);

        // CALCULADORA DE DÍAS GASTADOS
        let diasGastados = 0;
        solicitudes.forEach(sol => {
            // Solo restamos si son Vacaciones y si Ana ya las aprobó
            if (sol.estado_aprobacion === 'Aprobado' && sol.tipo_permiso === 'Vacaciones') {
                const fecha1 = new Date(sol.fecha_inicio);
                const fecha2 = new Date(sol.fecha_fin);
                // Calculamos la diferencia en días
                const diferenciaTiempo = Math.abs(fecha2 - fecha1);
                const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1; // +1 para contar el día de inicio y el de fin
                diasGastados += diferenciaDias;
            }
        });

        // El número real que le mostramos al empleado
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

// 2. Crear una nueva solicitud (¡Ahora recibe el tipo de permiso!)
const crearSolicitud = async (req, res) => {
    // Agregamos tipo_permiso para que ya no sea fijo
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