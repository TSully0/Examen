import { RUTA_SEMILLAS_JSON } from "./configuracion";
let estado = null;
let semillasData = null;
async function init() {
    if (estado)
        return;
    const res = await fetch(RUTA_SEMILLAS_JSON);
    if (!res.ok)
        throw new Error("No se pudo cargar semillas.json");
    const semillas = await res.json();
    semillasData = semillas;
    estado = {
        medicamentos: [...semillas.medicamentos],
        clientes: [...semillas.clientes],
        ventas: [...semillas.ventas],
    };
}
const pendiente = () => Promise.reject(new Error("no implementado"));
export const fuenteJson = {
    listarMedicamentos: async () => {
        await init();
        return [...(estado.medicamentos)];
    },
    listarClientes: async () => {
        await init();
        return [...(estado.clientes)];
    },
    crearCliente: async (datosCliente) => {
        await init();
        // simple validation: cedula única
        if (estado.clientes.some((c) => c.cedula === datosCliente.cedula)) {
            return Promise.reject(new Error("Cédula ya registrada"));
        }
        const nextId = Math.max(0, ...estado.clientes.map((c) => c.id)) + 1;
        const nuevo = { id: nextId, ...datosCliente };
        estado.clientes.push(nuevo);
        return { ...nuevo };
    },
    listarVentas: async () => {
        await init();
        return [...(estado.ventas)];
    },
    crearVenta: async (datosVenta) => {
        await init();
        const { medicamentoId, clienteId, cantidad } = datosVenta;
        const medicamento = estado.medicamentos.find((m) => m.id === medicamentoId);
        if (!medicamento)
            return Promise.reject(new Error("Medicamento no encontrado"));
        if (!medicamento.activo)
            return Promise.reject(new Error("Medicamento no está activo"));
        const cliente = estado.clientes.find((c) => c.id === clienteId);
        if (!cliente)
            return Promise.reject(new Error("Cliente no existe"));
        if (cantidad > medicamento.disponibles)
            return Promise.reject(new Error("Cantidad supera la disponibilidad"));
        const precioBruto = medicamento.precioUnitario * cantidad;
        const aplicaDescuento = cantidad >= (semillasData?.descuento?.desdeUnidades ?? 999999);
        const porcentaje = semillasData?.descuento?.porcentaje ?? 0;
        const total = aplicaDescuento ? Number((precioBruto * (1 - porcentaje / 100)).toFixed(2)) : Number(precioBruto.toFixed(2));
        const nextId = Math.max(0, ...estado.ventas.map((v) => v.id)) + 1;
        const venta = {
            id: nextId,
            medicamentoId,
            clienteId,
            cantidad,
            total,
            descuentoAplicado: aplicaDescuento,
            estado: semillasData?.estadoInicial ?? "PENDIENTE",
        };
        medicamento.disponibles = Math.max(0, medicamento.disponibles - cantidad);
        estado.ventas.push(venta);
        return { ...venta };
    },
    anularVenta: async (id) => {
        await init();
        const venta = estado.ventas.find((v) => v.id === id);
        if (!venta)
            return Promise.reject(new Error("Venta no encontrada"));
        if (venta.estado !== (semillasData?.estadoInicial ?? "PENDIENTE"))
            return Promise.reject(new Error("Sólo se puede anular una venta en estado inicial"));
        const medicamento = estado.medicamentos.find((m) => m.id === venta.medicamentoId);
        if (medicamento)
            medicamento.disponibles += venta.cantidad;
        venta.estado = semillasData?.estadoFinal ?? "ANULADA";
        return { ...venta };
    },
};
//# sourceMappingURL=datos.json.js.map