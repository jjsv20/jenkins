const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clienteSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del cliente es obligatorio'],
            trim: true,
            minlength: [3, 'El nombre del cliente debe tener al menos 3 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico del cliente es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [EMAIL_REGEX, 'El formato del correo electrónico no es válido'],
        },
    },
    {
        timestamps: {
            createdAt: 'fechaCreacion',
            updatedAt: 'fechaActualizacion',
        },
        versionKey: false,
    }
);

module.exports = mongoose.model('Cliente', clienteSchema);