const mongoose = require('mongoose');

const TIPOS_PROYECTO_PERMITIDOS = [
  'ensayo',
  'artículo',
  'monografía',
  'trabajo final de pregrado',
  'trabajo final de especialización',
];

const tipoProyectoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del tipo de proyecto es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            enum: {
                values: TIPOS_PROYECTO_PERMITIDOS,
                message: `El tipo de proyecto "{VALUE}" no es válido. Valores permitidos: ${TIPOS_PROYECTO_PERMITIDOS.join(', ')}`,
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
    TipoProyecto: mongoose.model('TipoProyecto', tipoProyectoSchema),
    TIPOS_PROYECTO_PERMITIDOS,
};