const { Etapa } = require('../models/Etapa');
const { AppError } = require('../middlewares/errorHandler');

const listarEtapas = async (req, res, next) => {
    try {
        const etapas = await Etapa.find().sort({ fechaCreacion: 1 });
        res.status(200).json({ ok: true, total: etapas.length, data: etapas });
    } catch (error) {
        next(error);
    }
};

const obtenerEtapaPorId = async (req, res, next) => {
    try {
        const etapa = await Etapa.findById(req.params.id);
        if (!etapa) {
            throw new AppError('Etapa no encontrada', 404);
        }
        res.status(200).json({ ok: true, data: etapa });
    } catch (error) {
        next(error);
    }
};

const crearEtapa = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        const nuevaEtapa = await Etapa.create({ nombre });
        res.status(201).json({
            ok: true,
            mensaje: 'Etapa creada exitosamente',
            data: nuevaEtapa,
        });
    } catch (error) {
        next(error);
    }
};

const actualizarEtapa = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        const etapaActualizada = await Etapa.findByIdAndUpdate(
            req.params.id,
            { nombre },
            { new: true, runValidators: true }
        );

        if (!etapaActualizada) {
            throw new AppError('Etapa no encontrada para actualizar', 404);
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Etapa actualizada exitosamente',
            data: etapaActualizada,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listarEtapas,
    obtenerEtapaPorId,
    crearEtapa,
    actualizarEtapa,
};