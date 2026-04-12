const db = require('../config/db');

// Función 1: Resumen del Dashboard (Ya la tenías)
const obtenerResumenAdmin = async (req, res) => {
    try {
        const [vacaciones] = await db.query("SELECT COUNT(*) as total_pendientes FROM solicitudes_vacaciones WHERE estado_aprobacion = 'Pendiente'");
        const [empleados] = await db.query("SELECT COUNT(*) as total_operadores FROM usuarios WHERE rol_id = 3");
        // ¡NUEVO! Contamos los requisitos pendientes
        const [requisitos] = await db.query("SELECT COUNT(*) as total_requisitos FROM requisitos_empleados WHERE estado_validacion = 'Pendiente'");

        res.status(200).json({
            exito: true,
            pendientesVacaciones: vacaciones[0].total_pendientes,
            totalEmpleados: empleados[0].total_operadores,
            pendientesRequisitos: requisitos[0].total_requisitos // Lo mandamos al Frontend
        });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Función 2: ¡NUEVA! Obtener la lista de solicitudes pendientes
const obtenerPendientes = async (req, res) => {
    try {
        // Hacemos un JOIN para traer el nombre del empleado junto con su solicitud
        const [solicitudes] = await db.query(`
            SELECT s.id, s.fecha_inicio, s.fecha_fin, s.tipo_permiso, u.nombre, u.id_numero_empleado 
            FROM solicitudes_vacaciones s 
            JOIN usuarios u ON s.usuario_id = u.id_numero_empleado 
            WHERE s.estado_aprobacion = 'Pendiente'
        `);
        res.status(200).json({ exito: true, data: solicitudes });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener pendientes' });
    }
};

// Función 3: ¡NUEVA! Aprobar o Rechazar
const actualizarSolicitud = async (req, res) => {
    const { id } = req.params; // ID de la solicitud
    const { estado, aprobador_id } = req.body; // 'Aprobado' o 'Rechazado'

    try {
        await db.query(
            'UPDATE solicitudes_vacaciones SET estado_aprobacion = ?, aprobador_id = ? WHERE id = ?',
            [estado, aprobador_id, id]
        );
        res.status(200).json({ exito: true, mensaje: `Solicitud ${estado} correctamente` });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar' });
    }
};

// Función 4: Obtener la lista de operadores activos con matemáticas de vacaciones e historial
const obtenerOperadores = async (req, res) => {
    try {
        // Traemos a los operadores (rol 3)
        const [operadores] = await db.query(
            'SELECT id_numero_empleado, nombre, correo, dias_vacaciones FROM usuarios WHERE rol_id = 3'
        );

        // Por cada operador, calculamos sus días reales y sacamos su historial
        for (let op of operadores) {
            const [solicitudes] = await db.query(
                'SELECT tipo_permiso, fecha_inicio, fecha_fin FROM solicitudes_vacaciones WHERE usuario_id = ? AND estado_aprobacion = "Aprobado" ORDER BY fecha_inicio DESC',
                [op.id_numero_empleado]
            );

            let diasGastados = 0;
            
            // Guardamos el historial para mandarlo al Frontend
            op.historial_permisos = solicitudes;

            // Calculamos cuántos días de "Vacaciones" ha gastado
            solicitudes.forEach(sol => {
                if (sol.tipo_permiso === 'Vacaciones') {
                    const f1 = new Date(sol.fecha_inicio);
                    const f2 = new Date(sol.fecha_fin);
                    const diffDias = Math.ceil(Math.abs(f2 - f1) / (1000 * 60 * 60 * 24)) + 1;
                    diasGastados += diffDias;
                }
            });

            // Creamos una nueva variable con los días reales
            op.dias_disponibles_reales = op.dias_vacaciones - diasGastados;
        }

        res.status(200).json({ exito: true, data: operadores });
    } catch (error) {
        console.error('Error al obtener operadores:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Función 5: Obtener los requisitos que los empleados dicen tener
const obtenerRequisitosPendientes = async (req, res) => {
    try {
        const [requisitos] = await db.query(`
            SELECT r.id, r.nombre_requisito, r.fecha_registro, u.nombre AS empleado 
            FROM requisitos_empleados r 
            JOIN usuarios u ON r.usuario_id = u.id_numero_empleado 
            WHERE r.estado_validacion = 'Pendiente'
        `);
        res.status(200).json({ exito: true, data: requisitos });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener requisitos' });
    }
};

// Función 6: Aprobar o Rechazar el requisito
const validarRequisito = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // 'Aprobado' o 'Rechazado'

    try {
        await db.query('UPDATE requisitos_empleados SET estado_validacion = ? WHERE id = ?', [estado, id]);
        res.status(200).json({ exito: true, mensaje: `Requisito ${estado}` });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al validar requisito' });
    }
};

module.exports = { obtenerResumenAdmin, obtenerPendientes, actualizarSolicitud, obtenerOperadores, obtenerRequisitosPendientes, validarRequisito };