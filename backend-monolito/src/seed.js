require('dotenv').config();
const mongoose = require('mongoose');
const { conectarDB, cerrarDB } = require('./config/db');
const { TipoProyecto, TIPOS_PROYECTO_PERMITIDOS } = require('./models/TipoProyecto');
const { Etapa, ETAPAS_PERMITIDAS } = require('./models/Etapa');
const Cliente = require('./models/Cliente');
const Universidad = require('./models/Universidad');
const Proyecto = require('./models/Proyecto');

/**
 * Script idempotente para poblar los catálogos maestros y proyectos iniciales
 * de prueba sin duplicar registros en ejecuciones repetidas.
 */
const ejecutarSeed = async () => {
    try {
        await conectarDB();
        console.log('[Seed Monolito] Iniciando carga de datos maestros...');

        // 1. Poblar Tipos de Proyecto (5 valores del catálogo)
        const mapaTipos = {};
        for (const nombre of TIPOS_PROYECTO_PERMITIDOS) {
            const doc = await TipoProyecto.findOneAndUpdate(
                { nombre },
                { $setOnInsert: { nombre } },
                { upsert: true, new: true, runValidators: true }
            );
            mapaTipos[nombre] = doc._id;
        }

        // 2. Poblar Etapas (4 valores del catálogo)
        const mapaEtapas = {};
        for (const nombre of ETAPAS_PERMITIDAS) {
            const doc = await Etapa.findOneAndUpdate(
                { nombre },
                { $setOnInsert: { nombre } },
                { upsert: true, new: true, runValidators: true }
            );
            mapaEtapas[nombre] = doc._id;
        }

        // 3. Poblar Universidades de prueba
        const universidadesData = [
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

        const universidadesGuardadas = [];
        for (const uni of universidadesData) {
            const doc = await Universidad.findOneAndUpdate(
                { nombre: uni.nombre },
                { $setOnInsert: uni },
                { upsert: true, new: true, runValidators: true }
            );
            universidadesGuardadas.push(doc);
        }

        // 4. Poblar Clientes de prueba
        const clientesData = [
            { nombre: 'Laura Gómez Restrepo', email: 'laura.gomez@est.iudigital.edu.co' },
            { nombre: 'Carlos Andrés Mejía', email: 'carlos.mejia@est.iudigital.edu.co' },
        ];

        const clientesGuardados = [];
        for (const cli of clientesData) {
            const doc = await Cliente.findOneAndUpdate(
                { email: cli.email },
                { $setOnInsert: cli },
                { upsert: true, new: true, runValidators: true }
            );
            clientesGuardados.push(doc);
        }

        // 5. Poblar Proyectos de asesoría interrelacionados
        const proyectosData = [
            {
                numero: 'PRJ-IUD-2026-001',
                titulo: 'Arquitecturas Cloud Native y Despliegue Continuo en Educación Superior',
                fechaIniciacion: new Date('2026-08-01T00:00:00.000Z'),
                fechaEntrega: new Date('2026-11-30T00:00:00.000Z'),
                valor: 2800000,
                cliente: clientesGuardados[0]._id,
                tipoProyecto: mapaTipos['trabajo final de especialización'],
                universidad: universidadesGuardadas[0]._id,
                etapa: mapaEtapas['entrega parcial 2'],
            },
            {
                numero: 'PRJ-IUD-2026-002',
                titulo: 'Análisis de Rendimiento entre Aplicaciones Monolíticas y Microservicios',
                fechaIniciacion: new Date('2026-09-10T00:00:00.000Z'),
                fechaEntrega: new Date('2026-12-15T00:00:00.000Z'),
                valor: 1950000,
                cliente: clientesGuardados[1]._id,
                tipoProyecto: mapaTipos['trabajo final de pregrado'],
                universidad: universidadesGuardadas[1]._id,
                etapa: mapaEtapas['anteproyecto'],
            },
        ];

        for (const prj of proyectosData) {
            await Proyecto.findOneAndUpdate(
                { numero: prj.numero },
                { $setOnInsert: prj },
                { upsert: true, new: true, runValidators: true }
            );
        }

        console.log('[Seed Monolito] Carga inicial finalizada con éxito.');
    } catch (error) {
        console.error('[Seed Monolito] Error durante la carga inicial:', error.message);
        process.exitCode = 1;
    } finally {
        await cerrarDB();
    }
};

ejecutarSeed();