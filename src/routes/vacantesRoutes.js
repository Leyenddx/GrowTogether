const express = require('express');
const router = express.Router();
const vacantesController = require('../controllers/vacantesController');

// Ruta para ver las vacantes
router.get('/', vacantesController.obtenerVacantes);
router.post('/postular', vacantesController.postularVacante);
router.post('/publicar', vacantesController.publicarVacante);

module.exports = router;