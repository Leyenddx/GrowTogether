const express = require('express');
const router = express.Router();
const multer = require('multer');
const empleadoController = require('../controllers/empleadoController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'perfil-' + Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    }
});
const upload = multer({ storage: storage });

router.get('/dashboard/:id', empleadoController.obtenerDashboardEmpleado);
router.get('/vacantes/:id_empleado', empleadoController.obtenerVacantesMatch);
router.post('/requisitos', empleadoController.reportarRequisito);

router.get('/perfil/:id_empleado', empleadoController.obtenerPerfil);
router.post('/perfil/foto', upload.single('foto'), empleadoController.actualizarFotoPerfil);

module.exports = router;