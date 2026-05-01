const db = require('../config/db');

const obtenerDashboardEmpleado = async (req, res) => {
    const { id } = req.params;

    try {

        const [jefe] = await db.query('SELECT nombre, correo FROM usuarios WHERE rol_id = 2 LIMIT 1');
        

        const [noticia] = await db.query('SELECT * FROM noticias ORDER BY fecha_publicacion DESC, id DESC LIMIT 1');
        

        const [postulacion] = await db.query(`
            SELECT p.estado_postulacion, v.titulo 
            FROM postulaciones p 
            JOIN vacantes v ON p.vacante_id = v.id 
            WHERE p.usuario_id = ? ORDER BY p.fecha DESC LIMIT 1
        `, [id]);


        const [tramite] = await db.query(`
            SELECT tipo_permiso, estado_aprobacion 
            FROM solicitudes_vacaciones 
            WHERE usuario_id = ? ORDER BY fecha_inicio DESC LIMIT 1
        `, [id]);

        res.status(200).json({
            exito: true,
            jefe: jefe[0] || null,
            noticia: noticia[0] || null,
            postulacion: postulacion[0] || null,
            tramite: tramite[0] || null
        });

    } catch (error) {
        console.error("Error en Dashboard:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al cargar el inicio' });
    }
};


const obtenerVacantesMatch = async (req, res) => {
    const { id_empleado } = req.params;

    try {
        const [vacantes] = await db.query('SELECT * FROM vacantes WHERE estado_activa = TRUE');
        
        const [misRequisitos] = await db.query(
            'SELECT nombre_requisito FROM requisitos_empleados WHERE usuario_id = ? AND estado_validacion = "Aprobado"', 
            [id_empleado]
        );
        const misReqNombres = misRequisitos.map(r => r.nombre_requisito);

        const [misPostulaciones] = await db.query(
            'SELECT vacante_id FROM postulaciones WHERE usuario_id = ?', 
            [id_empleado]
        );
        const misVacantesPostuladas = misPostulaciones.map(p => p.vacante_id);

        for (let vacante of vacantes) {
            const [requisitosVacante] = await db.query('SELECT requisito FROM vacante_requisitos WHERE vacante_id = ?', [vacante.id]);
            
            vacante.lista_requisitos = requisitosVacante;
            vacante.match_porcentaje = 0;
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


const reportarRequisito = async (req, res) => {

    const { id_empleado, nombre_requisito } = req.body; 

    try {

        await db.query(
            'INSERT INTO requisitos_empleados (usuario_id, nombre_requisito, estado_validacion, fecha_registro) VALUES (?, ?, "Pendiente", CURDATE())',
            [id_empleado, nombre_requisito]
        );
        res.status(200).json({ exito: true, mensaje: 'Certificación enviada a validación' });
    } catch (error) {
        console.error("Error al reportar requisito:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar la solicitud' });
    }
};


const obtenerPerfil = async (req, res) => {
    const { id_empleado } = req.params;

    try {
        const [usuario] = await db.query(
            'SELECT nombre, correo, id_numero_empleado, foto_perfil, fecha_ingreso, planta, turno FROM usuarios WHERE id_numero_empleado = ?',
            [id_empleado]
        );

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
        console.error("Error al actualizar foto:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar foto' });
    }
};

module.exports = { 
    obtenerDashboardEmpleado, 
    obtenerVacantesMatch, 
    reportarRequisito, 
    obtenerPerfil, 
    actualizarFotoPerfil 
};