const express = require('express');
const {
    listarTiposProyecto,
    obtenerTipoProyectoPorId,
    crearTipoProyecto,
    actualizarTipoProyecto,
} = require('../controllers/tipoProyectoController');

const router = express.Router();

router.get('/', listarTiposProyecto);
router.get('/:id', obtenerTipoProyectoPorId);
router.post('/', crearTipoProyecto);
router.put('/:id', actualizarTipoProyecto);

module.exports = router;