const express = require('express');
const {
    listarEtapas,
    obtenerEtapaPorId,
    crearEtapa,
    actualizarEtapa,
} = require('../controllers/etapaController');

const router = express.Router();

router.get('/', listarEtapas);
router.get('/:id', obtenerEtapaPorId);
router.post('/', crearEtapa);
router.put('/:id', actualizarEtapa);

module.exports = router;