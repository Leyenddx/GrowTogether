const db = require('../config/db');

const crearNoticia = async (req, res) => {
    const { autor_id, titulo, contenido } = req.body;
    
    const imagen_url = req.file ? '/uploads/' + req.file.filename : null;

    try {
        await db.query(
            'INSERT INTO noticias (autor_id, titulo, contenido, fecha_publicacion, es_urgente, imagen_url) VALUES (?, ?, ?, CURDATE(), FALSE, ?)',
            [autor_id, titulo, contenido, imagen_url]
        );
        res.status(200).json({ exito: true, mensaje: 'Comunicado con imagen publicado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ exito: false, mensaje: 'Error al publicar la noticia' });
    }
};

const obtenerNoticias = async (req, res) => {
    try {
        const [noticias] = await db.query(`
            SELECT n.*, u.nombre AS autor 
            FROM noticias n 
            JOIN usuarios u ON n.autor_id = u.id_numero_empleado 
            ORDER BY n.fecha_publicacion DESC, n.id DESC LIMIT 5
        `);
        res.status(200).json({ exito: true, data: noticias });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener noticias' });
    }
};

module.exports = { crearNoticia, obtenerNoticias };