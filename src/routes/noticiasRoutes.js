const express = require('express');
const router = express.Router();
const multer = require('multer');
const noticiasController = require('../controllers/noticiasController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    }
});
const upload = multer({ storage: storage });

router.post('/publicar', upload.single('imagen'), noticiasController.crearNoticia);
router.get('/', noticiasController.obtenerNoticias);

module.exports = router;