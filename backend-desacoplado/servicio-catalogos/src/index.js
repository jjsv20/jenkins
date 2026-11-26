require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { conectarDB, cerrarDB } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const tipoProyectoRoutes = require('./routes/tipoProyectoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const universidadRoutes = require('./routes/universidadRoutes');
const etapaRoutes = require('./routes/etapaRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    const dbConectada = mongoose.connection.readyState === 1;
    res.status(dbConectada ? 200 : 503).json({
        ok: dbConectada,
        servicio: 'servicio-catalogos',
        puerto: Number(PORT),
        baseDatos: dbConectada ? 'conectada' : 'desconectada',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/universidades', universidadRoutes);
app.use('/api/etapas', etapaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const iniciarServidor = async () => {
    await conectarDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[servicio-catalogos] Escuchando en http://0.0.0.0:${PORT}`);
    });

    const shutdown = async (signal) => {
        console.log(`\n[servicio-catalogos] Señal ${signal} recibida. Cerrando...`);
        server.close(async () => {
            await cerrarDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
};

iniciarServidor();