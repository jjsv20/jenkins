const mongoose = require('mongoose');

const ETAPAS_PERMITIDAS = [
    'anteproyecto',
    'entrega parcial 1',
    'entrega parcial 2',
    'entrega final',
];

const etapaSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre de la etapa es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            enum: {
                values: ETAPAS_PERMITIDAS,
                message: `La etapa "{VALUE}" no es válida. Valores permitidos: ${ETAPAS_PERMITIDAS.join(', ')}`,
            },
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

module.exports = {
    Etapa: mongoose.model('Etapa', etapaSchema),
    ETAPAS_PERMITIDAS,
};