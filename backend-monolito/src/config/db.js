const mongoose = require('mongoose');

/**
 * Establece la conexión con MongoDB usando Mongoose y registra
 * manejadores de eventos para monitorear el ciclo de vida de la conexión.
 */
const conectarDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iudigital_asesorias_monolito';

    mongoose.connection.on('connected', () => {
        console.log(`[MongoDB] Conexión establecida correctamente con: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error(`[MongoDB] Error en la conexión de base de datos: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Conexión con base de datos desconectada.');
    });

    try {
        await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
    });
    } catch (error) {
        console.error(`[MongoDB] Fallo crítico al conectar inicialmente: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Cierra ordenadamente la conexión cuando el proceso recibe señales de terminación.
 */
const cerrarDB = async () => {
    await mongoose.connection.close();
    console.log('[MongoDB] Conexión cerrada de forma segura.');
};

module.exports = { conectarDB, cerrarDB };