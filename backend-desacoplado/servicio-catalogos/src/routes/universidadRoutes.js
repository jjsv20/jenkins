const express = require('express');
const {
    listarUniversidades,
    obtenerUniversidadPorId,
    crearUniversidad,
    actualizarUniversidad,
} = require('../controllers/universidadController');

const router = express.Router();

router.get('/', listarUniversidades);
router.get('/:id', obtenerUniversidadPorId);
router.post('/', crearUniversidad);
router.put('/:id', actualizarUniversidad);

module.exports = router;