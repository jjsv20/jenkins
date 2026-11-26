const express = require('express');
const {
    listarClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
} = require('../controllers/clienteController');

const router = express.Router();

router.get('/', listarClientes);
router.get('/:id', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);

module.exports = router;