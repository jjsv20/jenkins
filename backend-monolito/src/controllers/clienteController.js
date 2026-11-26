const Cliente = require('../models/Cliente');
const { AppError } = require('../middlewares/errorHandler');

const listarClientes = async (req, res, next) => {
    try {
        const clientes = await Cliente.find().sort({ fechaCreacion: -1 });
        res.status(200).json({ ok: true, total: clientes.length, data: clientes });
    } catch (error) {
        next(error);
    }
};

const obtenerClientePorId = async (req, res, next) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            throw new AppError('Cliente no encontrado', 404);
        }
        res.status(200).json({ ok: true, data: cliente });
    } catch (error) {
        next(error);
    }
};

const crearCliente = async (req, res, next) => {
    try {
        const { nombre, email } = req.body;
        const nuevoCliente = await Cliente.create({ nombre, email });
        res.status(201).json({
            ok: true,
            mensaje: 'Cliente creado exitosamente',
            data: nuevoCliente,
        });
    } catch (error) {
        next(error);
    }
};

const actualizarCliente = async (req, res, next) => {
    try {
        const { nombre, email } = req.body;
        const camposActualizar = {};
        if (nombre !== undefined) camposActualizar.nombre = nombre;
        if (email !== undefined) camposActualizar.email = email;

        const clienteActualizado = await Cliente.findByIdAndUpdate(
            req.params.id,
            camposActualizar,
            { new: true, runValidators: true }
        );

        if (!clienteActualizado) {
            throw new AppError('Cliente no encontrado para actualizar', 404);
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Cliente actualizado exitosamente',
            data: clienteActualizado,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listarClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
};