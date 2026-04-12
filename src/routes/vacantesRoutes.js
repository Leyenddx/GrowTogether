const express = require('express');
const router = express.Router();
const vacantesController = require('../controllers/vacantesController');

router.get('/', vacantesController.obtenerVacantes);
router.post('/postular', vacantesController.postularVacante);
router.post('/publicar', vacantesController.publicarVacante);
router.put('/cerrar/:id', vacantesController.cerrarVacante);
router.delete('/eliminar/:id', vacantesController.eliminarVacante);

// Rutas de Gestión de Postulaciones (Para el Supervisor)
router.get('/postulaciones', vacantesController.obtenerPostulaciones);
router.put('/postulaciones/aprobar/:id', vacantesController.aprobarPostulacion);
router.put('/postulaciones/rechazar/:id', vacantesController.rechazarPostulacion);
router.get('/mis-postulaciones/:id_empleado', vacantesController.obtenerMisPostulaciones);

router.get('/mis-postulaciones/:id_empleado', vacantesController.obtenerMisPostulaciones);

module.exports = router;