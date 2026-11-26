require('dotenv').config();
const { conectarDB, cerrarDB } = require('./config/db');
const Proyecto = require('./models/Proyecto');

const CATALOGOS_BASE_URL = (process.env.CATALOGOS_SERVICE_URL || 'http://localhost:4001').replace(
    /\/+$/,
    ''
);

const obtenerPrimerId = async (recurso) => {
    const res = await fetch(`${CATALOGOS_BASE_URL}/api/${recurso}`);
    if (!res.ok) {
        throw new Error(`No se pudo consultar /api/${recurso} en ${CATALOGOS_BASE_URL}`);
    }
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
        throw new Error(`El catálogo "${recurso}" no tiene registros. Ejecuta primero el seed de catálogos.`);
    }
    return json.data[0]._id;
};

const ejecutarSeedProyectos = async () => {
    try {
        await conectarDB();
        console.log('[Seed Proyectos] Obteniendo referencias desde servicio-catalogos...');

        const [clienteId, tipoProyectoId, universidadId, etapaId] = await Promise.all([
            obtenerPrimerId('clientes'),
            obtenerPrimerId('tipos-proyecto'),
            obtenerPrimerId('universidades'),
            obtenerPrimerId('etapas'),
        ]);

        const proyectos = [
            {
                numero: 'PRJ-DES-2026-001',
                titulo: 'Microservicio Desacoplado para Gestión de Asesorías en IUDigital',
                fechaIniciacion: new Date('2026-08-15T00:00:00.000Z'),
                fechaEntrega: new Date('2026-11-25T00:00:00.000Z'),
                valor: 3200000,
                cliente: clienteId,
                tipoProyecto: tipoProyectoId,
                universidad: universidadId,
                etapa: etapaId,
            },
            {
                numero: 'PRJ-DES-2026-002',
                titulo: 'Pipeline de Despliegue Continuo con Docker y Jenkins en Entornos Académicos',
                fechaIniciacion: new Date('2026-09-01T00:00:00.000Z'),
                fechaEntrega: new Date('2026-12-10T00:00:00.000Z'),
                valor: 2450000,
                cliente: clienteId,
                tipoProyecto: tipoProyectoId,
                universidad: universidadId,
                etapa: etapaId,
            },
        ];

        for (const prj of proyectos) {
            await Proyecto.findOneAndUpdate(
                { numero: prj.numero },
                { $setOnInsert: prj },
                { upsert: true, new: true, runValidators: true }
            );
        }

        console.log('[Seed Proyectos] Proyectos iniciales cargados correctamente.');
    } catch (error) {
        console.error('[Seed Proyectos] Error:', error.message);
        process.exitCode = 1;
    } finally {
        await cerrarDB();
    }
};

ejecutarSeedProyectos();