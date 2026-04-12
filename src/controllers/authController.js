const db = require('../config/db');

const login = async (req, res) => {
    // Recibimos los datos que el celular nos mande
    const { correo, contrasena } = req.body;

    try {
        // Buscamos en MySQL si el correo y la contraseña coinciden
        const [usuarios] = await db.query(
            'SELECT id_numero_empleado, nombre, rol_id FROM usuarios WHERE correo = ? AND contrasena = ?', 
            [correo, contrasena]
        );

        if (usuarios.length > 0) {
            // Si lo encuentra, le damos la bienvenida
            res.status(200).json({ exito: true, mensaje: 'Login exitoso', usuario: usuarios[0] });
        } else {
            // Si no, lo rebotamos
            res.status(401).json({ exito: false, mensaje: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

module.exports = { login };