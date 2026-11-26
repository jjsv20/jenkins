const { TipoProyecto } = require('../models/TipoProyecto');
const { AppError } = require('../middlewares/errorHandler');

const listarTiposProyecto = async (req, res, next) => {
    try {
        const tipos = await TipoProyecto.find().sort({ fechaCreacion: -1 });
        res.status(200).json({ ok: true, total: tipos.length, data: tipos });
    } catch (error) {
        next(error);
    }
};

const obtenerTipoProyectoPorId = async (req, res, next) => {
    try {
        const tipo = await TipoProyecto.findById(req.params.id);
        if (!tipo) {
            throw new AppError('Tipo de proyecto no encontrado', 404);
        }
        res.status(200).json({ ok: true, data: tipo });
    } catch (error) {
        next(error);
    }
};

const crearTipoProyecto = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        const nuevoTipo = await TipoProyecto.create({ nombre });
        res.status(201).json({
            ok: true,
            mensaje: 'Tipo de proyecto creado exitosamente',
            data: nuevoTipo,
        });
    } catch (error) {
        next(error);
    }
};

const actualizarTipoProyecto = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        const tipoActualizado = await TipoProyecto.findByIdAndUpdate(
            req.params.id,
            { nombre },
            { new: true, runValidators: true }
        );

        if (!tipoActualizado) {
            throw new AppError('Tipo de proyecto no encontrado para actualizar', 404);
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Tipo de proyecto actualizado exitosamente',
            data: tipoActualizado,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listarTiposProyecto,
    obtenerTipoProyectoPorId,
    crearTipoProyecto,
    actualizarTipoProyecto,
};