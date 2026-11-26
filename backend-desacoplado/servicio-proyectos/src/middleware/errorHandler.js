class AppError extends Error {
    constructor(message, statusCode = 400, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }
}

const notFoundHandler = (req, res, next) => {
    next(new AppError(`Ruta no encontrada en servicio-proyectos: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    let details = err.details || null;

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación en los datos enviados';
        details = Object.values(err.errors).map((e) => ({
            campo: e.path,
            mensaje: e.message,
        }));
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Formato inválido para el campo "${err.path}": valor "${err.value}"`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const campoDuplicado = Object.keys(err.keyValue || {})[0] || 'campo único';
        const valorDuplicado = err.keyValue ? err.keyValue[campoDuplicado] : '';
        message = `Conflicto de duplicidad: ya existe un registro con ${campoDuplicado} = "${valorDuplicado}"`;
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'El cuerpo de la petición contiene JSON mal formado';
    }

    if (statusCode === 500) {
        console.error('[Error Interno Proyectos 500]:', err);
    }

    res.status(statusCode).json({
        ok: false,
        servicio: 'servicio-proyectos',
        mensaje: message,
        ...(details && { errores: details }),
    });
};

module.exports = { AppError, notFoundHandler, errorHandler };