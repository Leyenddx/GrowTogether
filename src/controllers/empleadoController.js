const db = require('../config/db');

const obtenerDashboardEmpleado = async (req, res) => {
    const { id } = req.params; // Recibimos la nómina del empleado (ej. Juan)

    try {
        // 1. Buscamos a su jefe (Por ahora tomaremos al primer Supervisor/Rol 2 que exista)
        const [jefe] = await db.query('SELECT nombre, correo FROM usuarios WHERE rol_id = 2 LIMIT 1');
        
       // 2. Buscamos la noticia más reciente (Ordenada por ID para desempatar fechas)
        const [noticia] = await db.query('SELECT * FROM noticias ORDER BY fecha_publicacion DESC, id DESC LIMIT 1');
        
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

// 2. Obtener vacantes y calcular el Match % (AHORA CON REVISIÓN DE POSTULACIONES)
const obtenerVacantesMatch = async (req, res) => {
    const { id_empleado } = req.params;

    try {
        const [vacantes] = await db.query('SELECT * FROM vacantes WHERE estado_activa = TRUE');
        
        // Obtenemos los requisitos
        const [misRequisitos] = await db.query(
            'SELECT nombre_requisito FROM requisitos_empleados WHERE usuario_id = ? AND estado_validacion = "Aprobado"', 
            [id_empleado]
        );
        const misReqNombres = misRequisitos.map(r => r.nombre_requisito);

        // NUEVO: Obtenemos a cuáles vacantes ya se postuló este usuario
        const [misPostulaciones] = await db.query(
            'SELECT vacante_id FROM postulaciones WHERE usuario_id = ?', 
            [id_empleado]
        );
        const misVacantesPostuladas = misPostulaciones.map(p => p.vacante_id);

        for (let vacante of vacantes) {
            const [requisitosVacante] = await db.query('SELECT requisito FROM vacante_requisitos WHERE vacante_id = ?', [vacante.id]);
            
            vacante.lista_requisitos = requisitosVacante;
            vacante.match_porcentaje = 0;
            // NUEVO: Le ponemos una etiqueta si ya está postulado
            vacante.ya_postulado = misVacantesPostuladas.includes(vacante.id);

            if (requisitosVacante.length > 0) {
                let requisitosCumplidos = 0;
                vacante.lista_requisitos.forEach(reqVac => {
                    reqVac.lo_tengo = misReqNombres.includes(reqVac.requisito);
                    if (reqVac.lo_tengo) requisitosCumplidos++;
                });
                vacante.match_porcentaje = Math.round((requisitosCumplidos / requisitosVacante.length) * 100);
            }
        }

        res.status(200).json({ exito: true, data: vacantes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ exito: false, mensaje: 'Error al calcular match' });
    }
};

// 3. Reportar un requisito nuevo (Se va a pendiente para que Ana lo apruebe)
const reportarRequisito = async (req, res) => {
    const { usuario_id, nombre_requisito } = req.body;
    try {
        await db.query(
            'INSERT INTO requisitos_empleados (usuario_id, nombre_requisito, estado_validacion, fecha_registro) VALUES (?, ?, "Pendiente", CURDATE())',
            [usuario_id, nombre_requisito]
        );
        res.status(200).json({ exito: true, mensaje: 'Enviado a validación' });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al reportar requisito' });
    }
};

// 4. Obtener todos los datos del perfil
const obtenerPerfil = async (req, res) => {
    const { id_empleado } = req.params;

    try {
        // Obtenemos los datos básicos del usuario
        const [usuario] = await db.query(
            'SELECT nombre, correo, id_numero_empleado, foto_perfil, fecha_ingreso, planta, turno FROM usuarios WHERE id_numero_empleado = ?',
            [id_empleado]
        );

        // Obtenemos sus certificaciones (Requisitos que Ana ya le aprobó)
        const [certificaciones] = await db.query(
            'SELECT nombre_requisito, fecha_registro FROM requisitos_empleados WHERE usuario_id = ? AND estado_validacion = "Aprobado"',
            [id_empleado]
        );

        res.status(200).json({ 
            exito: true, 
            perfil: usuario[0], 
            certificaciones: certificaciones 
        });
    } catch (error) {
        console.error("Error al cargar perfil:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al cargar perfil' });
    }
};

// 5. Subir o actualizar foto de perfil
const actualizarFotoPerfil = async (req, res) => {
    const { id_empleado } = req.body;
    const foto_url = req.file ? '/uploads/' + req.file.filename : null;

    if (!foto_url) {
        return res.status(400).json({ exito: false, mensaje: 'No se recibió ninguna imagen' });
    }

    try {
        await db.query('UPDATE usuarios SET foto_perfil = ? WHERE id_numero_empleado = ?', [foto_url, id_empleado]);
        res.status(200).json({ exito: true, mensaje: 'Foto actualizada con éxito', foto_url });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar foto' });
    }
};

// Tu module.exports se queda igual, hasta el final:
module.exports = { 
    obtenerDashboardEmpleado, 
    obtenerVacantesMatch, 
    reportarRequisito, 
    obtenerPerfil, 
    actualizarFotoPerfil 
};

module.exports = { 
    obtenerDashboardEmpleado, 
    obtenerVacantesMatch, 
    reportarRequisito, 
    obtenerPerfil, 
    actualizarFotoPerfil 
};