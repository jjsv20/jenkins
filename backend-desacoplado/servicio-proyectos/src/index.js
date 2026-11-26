require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { conectarDB, cerrarDB } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const proyectoRoutes = require('./routes/proyectoRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    const dbConectada = mongoose.connection.readyState === 1;
    res.status(dbConectada ? 200 : 503).json({
        ok: dbConectada,
        servicio: 'servicio-proyectos',
        puerto: Number(PORT),
        catalogosUrl: process.env.CATALOGOS_SERVICE_URL || 'http://localhost:4001',
        baseDatos: dbConectada ? 'conectada' : 'desconectada',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/proyectos', proyectoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const iniciarServidor = async () => {
    await conectarDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[servicio-proyectos] Escuchando en http://0.0.0.0:${PORT}`);
    });

    const shutdown = async (signal) => {
        console.log(`\n[servicio-proyectos] Señal ${signal} recibida. Cerrando...`);
        server.close(async () => {
            await cerrarDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
};

iniciarServidor();