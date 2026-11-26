const express = require('express');
const {
    listarProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
} = require('../controllers/proyectoController');

const router = express.Router();

router.get('/', listarProyectos);
router.get('/:id', obtenerProyectoPorId);
router.post('/', crearProyecto);
router.put('/:id', actualizarProyecto);

module.exports = router;