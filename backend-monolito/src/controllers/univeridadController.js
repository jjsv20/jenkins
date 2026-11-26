const Universidad = require('../models/Universidad');
const { AppError } = require('../middlewares/errorHandler');

const listarUniversidades = async (req, res, next) => {
    try {
        const universidades = await Universidad.find().sort({ fechaCreacion: -1 });
        res.status(200).json({ ok: true, total: universidades.length, data: universidades });
    } catch (error) {
        next(error);
    }
};

const obtenerUniversidadPorId = async (req, res, next) => {
    try {
        const universidad = await Universidad.findById(req.params.id);
        if (!universidad) {
            throw new AppError('Universidad no encontrada', 404);
        }
        res.status(200).json({ ok: true, data: universidad });
    } catch (error) {
        next(error);
    }
};

const crearUniversidad = async (req, res, next) => {
    try {
        const { nombre, direccion, telefono } = req.body;
        const nuevaUniversidad = await Universidad.create({ nombre, direccion, telefono });
        res.status(201).json({
            ok: true,
            mensaje: 'Universidad creada exitosamente',
            data: nuevaUniversidad,
        });
    } catch (error) {
        next(error);
    }
};

const actualizarUniversidad = async (req, res, next) => {
    try {
        const { nombre, direccion, telefono } = req.body;
        const camposActualizar = {};
        if (nombre !== undefined) camposActualizar.nombre = nombre;
        if (direccion !== undefined) camposActualizar.direccion = direccion;
        if (telefono !== undefined) camposActualizar.telefono = telefono;

        const universidadActualizada = await Universidad.findByIdAndUpdate(
            req.params.id,
            camposActualizar,
            { new: true, runValidators: true }
        );

        if (!universidadActualizada) {
            throw new AppError('Universidad no encontrada para actualizar', 404);
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Universidad actualizada exitosamente',
            data: universidadActualizada,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listarUniversidades,
    obtenerUniversidadPorId,
    crearUniversidad,
    actualizarUniversidad,
};