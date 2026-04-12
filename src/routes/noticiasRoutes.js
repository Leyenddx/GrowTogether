const express = require('express');
const router = express.Router();
const multer = require('multer');
const noticiasController = require('../controllers/noticiasController');

// Configuración del "Cartero" (Multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // ¿Dónde se guarda?
    },
    filename: function (req, file, cb) {
        // Le ponemos la fecha actual al nombre para que nunca se repitan
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    }
});
const upload = multer({ storage: storage });

// La ruta ahora usa "upload.single('imagen')" antes del controlador
router.post('/publicar', upload.single('imagen'), noticiasController.crearNoticia);
router.get('/', noticiasController.obtenerNoticias);

module.exports = router;