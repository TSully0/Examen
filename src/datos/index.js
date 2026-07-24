import { leerFuente } from "./configuracion";
import { fuenteMemoria } from "./datos.memoria";
import { fuenteJson } from "./datos.json";
import { fuenteApi } from "./datos.api";
function normalizar(valor) {
    if (valor === "memoria" || valor === "json" || valor === "api") {
        return valor;
    }
    console.warn(`Fuente de datos desconocida: "${valor}". Se usa "memoria".`);
    return "memoria";
}
export const FUENTE_ACTIVA = normalizar(leerFuente());
export function obtenerFuenteDatos() {
    switch (FUENTE_ACTIVA) {
        case "json":
            return fuenteJson;
        case "api":
            return fuenteApi;
        default:
            return fuenteMemoria;
    }
}
//# sourceMappingURL=index.js.map