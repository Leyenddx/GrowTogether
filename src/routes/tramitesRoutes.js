const express = require('express');
const router = express.Router();
const tramitesController = require('../controllers/tramitesController');

router.get('/mis-solicitudes/:id_empleado', tramitesController.obtenerMisSolicitudes);
router.post('/nueva-solicitud', tramitesController.crearSolicitud);

module.exports = router;