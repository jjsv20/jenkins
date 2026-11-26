const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema(
    {
        numero: {
            type: String,
            required: [true, 'El número o radicado del proyecto es obligatorio'],
            unique: true,
            trim: true,
        },
        titulo: {
            type: String,
            required: [true, 'El título del proyecto es obligatorio'],
            trim: true,
            minlength: [5, 'El título del proyecto debe tener al menos 5 caracteres'],
        },
        fechaIniciacion: {
            type: Date,
            required: [true, 'La fecha de iniciación es obligatoria'],
        },
        fechaEntrega: {
            type: Date,
            required: [true, 'La fecha de entrega es obligatoria'],
            validate: {
                validator: function (valorFechaEntrega) {
                    if (this && this.fechaIniciacion) {
                        return new Date(valorFechaEntrega) > new Date(this.fechaIniciacion);
                    }
                    return true;
                },
                message: 'La fecha de entrega debe ser estrictamente posterior a la fecha de iniciación',
            },
        },
        valor: {
            type: Number,
            required: [true, 'El valor económico de la asesoría es obligatorio'],
            min: [0.01, 'El valor de la asesoría debe ser mayor que 0'],
        },
        cliente: {
            type: String,
            required: [true, 'La referencia al cliente es obligatoria'],
            trim: true,
        },
        tipoProyecto: {
            type: String,
            required: [true, 'La referencia al tipo de proyecto es obligatoria'],
            trim: true,
        },
        universidad: {
            type: String,
            required: [true, 'La referencia a la universidad es obligatoria'],
            trim: true,
        },
        etapa: {
            type: String,
            required: [true, 'La referencia a la etapa del proyecto es obligatoria'],
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

module.exports = mongoose.model('Proyecto', proyectoSchema);