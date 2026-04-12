const express = require('express');
const router = express.Router();
const multer = require('multer');
const empleadoController = require('../controllers/empleadoController');

// Configuración de Multer para las fotos de perfil
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Guardamos en la misma carpeta que las noticias
    },
    filename: function (req, file, cb) {
        cb(null, 'perfil-' + Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    }
});
const upload = multer({ storage: storage });

// Rutas que ya tenías (¡Las de tu captura!)
router.get('/dashboard/:id', empleadoController.obtenerDashboardEmpleado);
router.get('/vacantes/:id_empleado', empleadoController.obtenerVacantesMatch);
router.post('/requisitos', empleadoController.reportarRequisito);

// ¡NUEVAS RUTAS DEL PERFIL QUE FALTABAN!
router.get('/perfil/:id_empleado', empleadoController.obtenerPerfil);
router.post('/perfil/foto', upload.single('foto'), empleadoController.actualizarFotoPerfil);

module.exports = router;