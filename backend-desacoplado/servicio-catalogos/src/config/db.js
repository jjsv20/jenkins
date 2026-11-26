const mongoose = require('mongoose');

const conectarDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iudigital_catalogos';

    mongoose.connection.on('connected', () => {
        console.log(`[MongoDB Catálogos] Conectado a: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error(`[MongoDB Catálogos] Error de conexión: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB Catálogos] Conexión desconectada.');
    });

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (error) {
        console.error(`[MongoDB Catálogos] Fallo crítico al conectar: ${error.message}`);
        process.exit(1);
    }
};

const cerrarDB = async () => {
    await mongoose.connection.close();
    console.log('[MongoDB Catálogos] Conexión cerrada de forma segura.');
};

module.exports = { conectarDB, cerrarDB };