require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { conectarDB, cerrarDB } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Importación de enrutadores de los 5 módulos de negocio
const tipoProyectoRoutes = require('./routes/tipoProyectoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const universidadRoutes = require('./routes/universidadRoutes');
const etapaRoutes = require('./routes/etapaRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Endpoint de salud para monitoreo en Docker Compose y Smoke Tests de Jenkins
app.get('/health', (req, res) => {
    const dbConectada = mongoose.connection.readyState === 1;
    const status = dbConectada ? 200 : 503;

    res.status(status).json({
        ok: dbConectada,
        servicio: 'backend-monolito',
        institucion: 'IUDigital de Antioquia',
        baseDatos: dbConectada ? 'conectada' : 'desconectada',
        timestamp: new Date().toISOString(),
    });
});

// Registro de rutas REST
app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/etapas', etapaRoutes);
app.use('/api/proyectos', proyectoRoutes);

// Manejo centralizado de rutas inexistentes y errores
app.use(notFoundHandler);
app.use(errorHandler);

const iniciarServidor = async () => {
    await conectarDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Servidor Monolítico] Ejecutándose en http://0.0.0.0:${PORT}`);
    });

    // Apagado elegante ante señales del sistema operativo / contenedores Docker
    const shutdown = async (signal) => {
        console.log(`\n[Servidor Monolítico] Señal ${signal} recibida. Cerrando recursos...`);
        server.close(async () => {
            await cerrarDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
};

iniciarServidor();