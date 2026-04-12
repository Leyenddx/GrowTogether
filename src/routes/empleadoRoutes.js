const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/dashboard/:id', empleadoController.obtenerDashboardEmpleado);

module.exports = router;