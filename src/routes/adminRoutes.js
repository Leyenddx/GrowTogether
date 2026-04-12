const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', adminController.obtenerResumenAdmin);
router.get('/solicitudes-pendientes', adminController.obtenerPendientes);
router.put('/solicitudes/:id', adminController.actualizarSolicitud);
router.get('/operadores', adminController.obtenerOperadores);
router.get('/requisitos-pendientes', adminController.obtenerRequisitosPendientes);
router.put('/requisitos/:id', adminController.validarRequisito);

module.exports = router;