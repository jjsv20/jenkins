const Proyecto = require('../models/Proyecto');
const { AppError } = require('../middlewares/errorHandler');
const {
    validarReferenciasEnCatalogos,
    enriquecerProyectoConCatalogos,
} = require('../clients/catalogosClient');

const listarProyectos = async (req, res, next) => {
    try {
        const proyectos = await Proyecto.find().sort({ fechaCreacion: -1 });
        const enriquecidos = await Promise.all(
            proyectos.map((proyecto) => enriquecerProyectoConCatalogos(proyecto))
        );
        res.status(200).json({ ok: true, total: enriquecidos.length, data: enriquecidos });
    } catch (error) {
        next(error);
    }
};

const obtenerProyectoPorId = async (req, res, next) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) {
            throw new AppError('Proyecto no encontrado', 404);
        }
        const enriquecido = await enriquecerProyectoConCatalogos(proyecto);
        res.status(200).json({ ok: true, data: enriquecido });
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

        if (fechaIniciacion && fechaEntrega && new Date(fechaEntrega) <= new Date(fechaIniciacion)) {
            throw new AppError('La fechaEntrega debe ser estrictamente posterior a fechaIniciacion', 400);
        }

        // Valida contra servicio-catalogos antes de insertar en la BD de proyectos
        const catalogosValidados = await validarReferenciasEnCatalogos({
            cliente,
            tipoProyecto,
            universidad,
            etapa,
        });

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

        const enriquecido = await enriquecerProyectoConCatalogos(nuevoProyecto);

        res.status(201).json({
            ok: true,
            mensaje: 'Proyecto creado exitosamente y validado contra servicio-catalogos',
            data: enriquecido,
            validacionCatalogos: catalogosValidados,
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

        const inicioEfectivo = fechaIniciacion
            ? new Date(fechaIniciacion)
            : new Date(proyectoExistente.fechaIniciacion);
        const entregaEfectiva = fechaEntrega
            ? new Date(fechaEntrega)
            : new Date(proyectoExistente.fechaEntrega);

        if (entregaEfectiva <= inicioEfectivo) {
            throw new AppError('La fechaEntrega debe ser estrictamente posterior a fechaIniciacion', 400);
        }

        await validarReferenciasEnCatalogos({
            cliente,
            tipoProyecto,
            universidad,
            etapa,
        });

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
        );

        const enriquecido = await enriquecerProyectoConCatalogos(proyectoActualizado);

        res.status(200).json({
            ok: true,
            mensaje: 'Proyecto actualizado exitosamente',
            data: enriquecido,
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