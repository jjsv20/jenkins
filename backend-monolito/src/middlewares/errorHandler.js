/**
 * Clase auxiliar para errores controlados de negocio con código HTTP específico.
 */
class AppError extends Error {
    constructor(message, statusCode = 400, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }
}

/**
 * Middleware para capturar rutas inexistentes (404).
 */
const notFoundHandler = (req, res, next) => {
    next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Middleware global centralizado para transformar errores de Mongoose,
 * llaves duplicadas, cast de ObjectId y excepciones de negocio en respuestas JSON uniformes.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    let details = err.details || null;

    // 1. Error de validación de esquemas Mongoose (enums, required, minlength, custom validators)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación en los datos enviados';
        details = Object.values(err.errors).map((e) => ({
            campo: e.path,
            mensaje: e.message,
        }));
    }

    // 2. Error de formato inválido en ObjectId o tipos casteados (CastError)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Formato inválido para el campo "${err.path}": valor "${err.value}"`;
    }

    // 3. Error de índice único duplicado en MongoDB (code: 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const campoDuplicado = Object.keys(err.keyValue || {})[0] || 'campo único';
        const valorDuplicado = err.keyValue ? err.keyValue[campoDuplicado] : '';
        message = `Conflicto de duplicidad: ya existe un registro con ${campoDuplicado} = "${valorDuplicado}"`;
    }

    // 4. Error de sintaxis en el cuerpo JSON de la petición
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'El cuerpo de la petición contiene JSON mal formado';
    }

    if (statusCode === 500) {
        console.error('[Error Interno 500]:', err);
    }

    res.status(statusCode).json({
        ok: false,
        mensaje: message,
        ...(details && { errores: details }),
    });
};

module.exports = { AppError, notFoundHandler, errorHandler };