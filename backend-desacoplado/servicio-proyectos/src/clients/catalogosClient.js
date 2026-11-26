const { AppError } = require('../middlewares/errorHandler');

const CATALOGOS_BASE_URL = (process.env.CATALOGOS_SERVICE_URL || 'http://localhost:4001').replace(
    /\/+$/,
    ''
);
const TIMEOUT_MS = Number(process.env.CATALOGOS_TIMEOUT_MS || 3000);

/**
 * Consulta un recurso específico en servicio-catalogos con timeout controlado.
 * Si el servicio no responde o hay error de red, lanza 503 Service Unavailable.
 * Si el recurso no existe (404) o el ID es inválido (400), retorna null o lanza 400.
 */
const consultarRecursoCatalogo = async (recursoPath, id, etiquetaCampo) => {
    const url = `${CATALOGOS_BASE_URL}/api/${recursoPath}/${encodeURIComponent(id)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (response.status === 404 || response.status === 400) {
            return { existe: false, data: null };
        }

        if (!response.ok) {
            throw new AppError(
                `El servicio de catálogos respondió con estado ${response.status} al validar ${etiquetaCampo}`,
                503
            );
        }

        const body = await response.json();
        return { existe: true, data: body.data || null };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        const motivo =
            error.name === 'TimeoutError'
                ? `tiempo de espera agotado (${TIMEOUT_MS} ms)`
                : error.message;

        throw new AppError(
            `No se pudo validar "${etiquetaCampo}" porque servicio-catalogos no está disponible (${motivo})`,
            503
        );
    }
};

/**
 * Valida en paralelo que todas las referencias enviadas existan en servicio-catalogos.
 */
const validarReferenciasEnCatalogos = async ({ cliente, tipoProyecto, universidad, etapa }) => {
    const comprobaciones = [];

    if (cliente !== undefined) {
        comprobaciones.push(
            consultarRecursoCatalogo('clientes', cliente, 'cliente').then((res) => {
                if (!res.existe) {
                    throw new AppError(`El cliente con ID "${cliente}" no existe en el servicio de catálogos`, 400);
                }
                return ['cliente', res.data];
            })
        );
    }

    if (tipoProyecto !== undefined) {
        comprobaciones.push(
            consultarRecursoCatalogo('tipos-proyecto', tipoProyecto, 'tipoProyecto').then((res) => {
                if (!res.existe) {
                    throw new AppError(
                        `El tipoProyecto con ID "${tipoProyecto}" no existe en el servicio de catálogos`,
                        400
                    );
                }
                return ['tipoProyecto', res.data];
            })
        );
    }

    if (universidad !== undefined) {
        comprobaciones.push(
            consultarRecursoCatalogo('universidades', universidad, 'universidad').then((res) => {
                if (!res.existe) {
                    throw new AppError(
                        `La universidad con ID "${universidad}" no existe en el servicio de catálogos`,
                        400
                    );
                }
                return ['universidad', res.data];
            })
        );
    }

    if (etapa !== undefined) {
        comprobaciones.push(
            consultarRecursoCatalogo('etapas', etapa, 'etapa').then((res) => {
                if (!res.existe) {
                    throw new AppError(`La etapa con ID "${etapa}" no existe en el servicio de catálogos`, 400);
                }
                return ['etapa', res.data];
            })
        );
    }

    const resultados = await Promise.all(comprobaciones);
    return Object.fromEntries(resultados);
};

/**
 * Hidrata de forma resiliente los datos de catálogo de un proyecto al listar/consultar.
 * Si servicio-catalogos no está disponible, conserva el ID sin romper la consulta.
 */
const enriquecerProyectoConCatalogos = async (proyectoDoc) => {
    const plano = typeof proyectoDoc.toObject === 'function' ? proyectoDoc.toObject() : { ...proyectoDoc };

    const tareas = [
        plano.cliente ? consultarRecursoCatalogo('clientes', plano.cliente, 'cliente').catch(() => null) : null,
        plano.tipoProyecto
            ? consultarRecursoCatalogo('tipos-proyecto', plano.tipoProyecto, 'tipoProyecto').catch(() => null)
            : null,
        plano.universidad
            ? consultarRecursoCatalogo('universidades', plano.universidad, 'universidad').catch(() => null)
            : null,
        plano.etapa ? consultarRecursoCatalogo('etapas', plano.etapa, 'etapa').catch(() => null) : null,
    ];

    const [cliRes, tipoRes, uniRes, etapaRes] = await Promise.all(tareas);

    return {
        ...plano,
        clienteDetalle: cliRes?.existe ? cliRes.data : null,
        tipoProyectoDetalle: tipoRes?.existe ? tipoRes.data : null,
        universidadDetalle: uniRes?.existe ? uniRes.data : null,
        etapaDetalle: etapaRes?.existe ? etapaRes.data : null,
    };
};

module.exports = {
    validarReferenciasEnCatalogos,
    enriquecerProyectoConCatalogos,
};