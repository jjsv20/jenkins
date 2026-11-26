const mongoose = require('mongoose');
const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');
const { TipoProyecto } = require('../models/TipoProyecto');
const Universidad = require('../models/Universidad');
const { Etapa } = require('../models/Etapa');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Valida que las llaves foráneas enviadas tengan formato ObjectId válido
 * y correspondan a registros existentes en cada colección catálogo.
 */
const validarReferenciasForaneas = async ({ cliente, tipoProyecto, universidad, etapa }) => {
    const verificaciones = [];

    if (cliente !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(cliente)) {
            throw new AppError('El ID de cliente proporcionado no tiene un formato válido', 400);
        }
        verificaciones.push(
            Cliente.exists({ _id: cliente }).then((existe) => {
                if (!existe) throw new AppError(`El cliente con ID "${cliente}" no existe`, 400);
            })
        );
    }

    if (tipoProyecto !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(tipoProyecto)) {
            throw new AppError('El ID de tipoProyecto proporcionado no tiene un formato válido', 400);
        }
        verificaciones.push(
            TipoProyecto.exists({ _id: tipoProyecto }).then((existe) => {
                if (!existe) throw new AppError(`El tipo de proyecto con ID "${tipoProyecto}" no existe`, 400);
            })
        );
    }

    if (universidad !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(universidad)) {
            throw new AppError('El ID de universidad proporcionado no tiene un formato válido', 400);
        }
        verificaciones.push(
            Universidad.exists({ _id: universidad }).then((existe) => {
                if (!existe) throw new AppError(`La universidad con ID "${universidad}" no existe`, 400);
            })
        );
    }

    if (etapa !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(etapa)) {
            throw new AppError('El ID de etapa proporcionado no tiene un formato válido', 400);
        }
        verificaciones.push(
            Etapa.exists({ _id: etapa }).then((existe) => {
                if (!existe) throw new AppError(`La etapa con ID "${etapa}" no existe`, 400);
            })
        );
    }

    await Promise.all(verificaciones);
};

const listarProyectos = async (req, res, next) => {
    try {
        const proyectos = await Proyecto.find()
            .populate('cliente', 'nombre email')
            .populate('tipoProyecto', 'nombre')
            .populate('universidad', 'nombre direccion telefono')
            .populate('etapa', 'nombre')
            .sort({ fechaCreacion: -1 });

        res.status(200).json({ ok: true, total: proyectos.length, data: proyectos });
    } catch (error) {
        next(error);
    }
};

const obtenerProyectoPorId = async (req, res, next) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id)
            .populate('cliente', 'nombre email')
            .populate('tipoProyecto', 'nombre')
            .populate('universidad', 'nombre direccion telefono')
            .populate('etapa', 'nombre');

        if (!proyecto) {
            throw new AppError('Proyecto no encontrado', 404);
        }

        res.status(200).json({ ok: true, data: proyecto });
    } catch (error) {
        next(error);
    }
};

const crearProyecto = async (req, res, next) => {
    try {
        const {
            numero,
            titulo,
            fechaIniciacion,
            fechaEntrega,
            valor,
            cliente,
            tipoProyecto,
            universidad,
            etapa,
        } = req.body;

        // Validar consistencia lógica de fechas
        if (fechaIniciacion && fechaEntrega && new Date(fechaEntrega) <= new Date(fechaIniciacion)) {
            throw new AppError('La fechaEntrega debe ser estrictamente posterior a fechaIniciacion', 400);
        }

        // Validar existencia previa de todas las referencias foráneas
        await validarReferenciasForaneas({ cliente, tipoProyecto, universidad, etapa });

        const nuevoProyecto = await Proyecto.create({
            numero,
            titulo,
            fechaIniciacion,
            fechaEntrega,
            valor,
            cliente,
            tipoProyecto,
            universidad,
            etapa,
        });

        const proyectoPopulado = await Proyecto.findById(nuevoProyecto._id)
            .populate('cliente', 'nombre email')
            .populate('tipoProyecto', 'nombre')
            .populate('universidad', 'nombre direccion telefono')
            .populate('etapa', 'nombre');

        res.status(201).json({
            ok: true,
            mensaje: 'Proyecto de asesoría creado exitosamente',
            data: proyectoPopulado,
        });
    } catch (error) {
        next(error);
    }
};

const actualizarProyecto = async (req, res, next) => {
    try {
        const proyectoExistente = await Proyecto.findById(req.params.id);
        if (!proyectoExistente) {
            throw new AppError('Proyecto no encontrado para actualizar', 404);
        }

        const {
            numero,
            titulo,
            fechaIniciacion,
            fechaEntrega,
            valor,
            cliente,
            tipoProyecto,
            universidad,
            etapa,
        } = req.body;

        // Validar coherencia entre fechas nuevas y almacenadas
        const inicioEfectivo = fechaIniciacion
            ? new Date(fechaIniciacion)
            : new Date(proyectoExistente.fechaIniciacion);
        const entregaEfectiva = fechaEntrega
            ? new Date(fechaEntrega)
            : new Date(proyectoExistente.fechaEntrega);

        if (entregaEfectiva <= inicioEfectivo) {
            throw new AppError('La fechaEntrega debe ser estrictamente posterior a fechaIniciacion', 400);
        }

        // Validar referencias foráneas si vienen en la petición de actualización
        await validarReferenciasForaneas({ cliente, tipoProyecto, universidad, etapa });

        const camposActualizar = {};
        if (numero !== undefined) camposActualizar.numero = numero;
        if (titulo !== undefined) camposActualizar.titulo = titulo;
        if (fechaIniciacion !== undefined) camposActualizar.fechaIniciacion = fechaIniciacion;
        if (fechaEntrega !== undefined) camposActualizar.fechaEntrega = fechaEntrega;
        if (valor !== undefined) camposActualizar.valor = valor;
        if (cliente !== undefined) camposActualizar.cliente = cliente;
        if (tipoProyecto !== undefined) camposActualizar.tipoProyecto = tipoProyecto;
        if (universidad !== undefined) camposActualizar.universidad = universidad;
        if (etapa !== undefined) camposActualizar.etapa = etapa;

        const proyectoActualizado = await Proyecto.findByIdAndUpdate(
            req.params.id,
            camposActualizar,
            { new: true, runValidators: true }
        )
            .populate('cliente', 'nombre email')
            .populate('tipoProyecto', 'nombre')
            .populate('universidad', 'nombre direccion telefono')
            .populate('etapa', 'nombre');

        res.status(200).json({
            ok: true,
            mensaje: 'Proyecto de asesoría actualizado exitosamente',
            data: proyectoActualizado,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listarProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
};