require('dotenv').config();
const { conectarDB, cerrarDB } = require('./config/db');
const { TipoProyecto, TIPOS_PROYECTO_PERMITIDOS } = require('./models/TipoProyecto');
const { Etapa, ETAPAS_PERMITIDAS } = require('./models/Etapa');
const Cliente = require('./models/Cliente');
const Universidad = require('./models/Universidad');

const ejecutarSeedCatalogos = async () => {
    try {
        await conectarDB();
        console.log('[Seed Catálogos] Poblando datos maestros...');

        for (const nombre of TIPOS_PROYECTO_PERMITIDOS) {
            await TipoProyecto.findOneAndUpdate(
                { nombre },
                { $setOnInsert: { nombre } },
                { upsert: true, new: true, runValidators: true }
            );
        }

        for (const nombre of ETAPAS_PERMITIDAS) {
            await Etapa.findOneAndUpdate(
                { nombre },
                { $setOnInsert: { nombre } },
                { upsert: true, new: true, runValidators: true }
            );
        }

        const universidades = [
            {
                nombre: 'Institución Universitaria Digital de Antioquia - IUDigital',
                direccion: 'Carrera 55 # 42-90, Medellín, Antioquia',
                telefono: '6045200750',
            },
            {
                nombre: 'Universidad de Antioquia',
                direccion: 'Calle 67 # 53-108, Medellín, Antioquia',
                telefono: '6042198332',
            },
        ];

        for (const uni of universidades) {
            await Universidad.findOneAndUpdate(
                { nombre: uni.nombre },
                { $setOnInsert: uni },
                { upsert: true, new: true, runValidators: true }
            );
        }

        const clientes = [
            { nombre: 'Laura Gómez Restrepo', email: 'laura.gomez@est.iudigital.edu.co' },
            { nombre: 'Carlos Andrés Mejía', email: 'carlos.mejia@est.iudigital.edu.co' },
        ];

        for (const cli of clientes) {
            await Cliente.findOneAndUpdate(
                { email: cli.email },
                { $setOnInsert: cli },
                { upsert: true, new: true, runValidators: true }
            );
        }

        console.log('[Seed Catálogos] Datos maestros cargados correctamente.');
    } catch (error) {
        console.error('[Seed Catálogos] Error:', error.message);
        process.exitCode = 1;
    } finally {
        await cerrarDB();
    }
};

ejecutarSeedCatalogos();