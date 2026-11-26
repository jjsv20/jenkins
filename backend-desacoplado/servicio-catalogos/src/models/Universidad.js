const mongoose = require('mongoose');

const universidadSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre de la universidad es obligatorio'],
            unique: true,
            trim: true,
        },
        direccion: {
            type: String,
            required: [true, 'La dirección de la universidad es obligatoria'],
            trim: true,
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono de la universidad es obligatorio'],
            trim: true,
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

module.exports = mongoose.model('Universidad', universidadSchema);