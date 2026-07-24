import type { FuenteDatos } from "./contrato";
import type { Medicamento, Cliente, NuevoCliente, Venta, NuevaVenta } from "../dominio";
import semillas from "../../mock/semillas.json" assert { type: "json" };

const datos = {
  medicamentos: [...semillas.medicamentos] as Medicamento[],
  clientes: [...semillas.clientes] as Cliente[],
  ventas: [...semillas.ventas] as Venta[],
};

const pendiente = () => Promise.reject(new Error("no implementado"));

export const fuenteMemoria: FuenteDatos = {
  listarMedicamentos: () => Promise.resolve([...datos.medicamentos]),
  listarClientes: () => Promise.resolve([...datos.clientes]),
  crearCliente: async (datosCliente: NuevoCliente) => {
    const nextId = Math.max(0, ...datos.clientes.map((c) => c.id)) + 1;
    const nuevo: Cliente = { id: nextId, ...datosCliente } as Cliente;
    datos.clientes.push(nuevo);
    return Promise.resolve({ ...nuevo });
  },
  listarVentas: () => Promise.resolve([...datos.ventas]),
  crearVenta: async (datosVenta: NuevaVenta) => {
    const { medicamentoId, clienteId, cantidad } = datosVenta as any;
    const medicamento = datos.medicamentos.find((m) => m.id === medicamentoId);
    if (!medicamento) return Promise.reject(new Error("Medicamento no encontrado"));
    if (!medicamento.activo) return Promise.reject(new Error("Medicamento no está activo"));
    const cliente = datos.clientes.find((c) => c.id === clienteId);
    if (!cliente) return Promise.reject(new Error("Cliente no existe"));
    if (cantidad > medicamento.disponibles) return Promise.reject(new Error("Cantidad supera la disponibilidad"));

    const precioBruto = medicamento.precioUnitario * cantidad;
    const aplicaDescuento = cantidad >= (semillas.descuento?.desdeUnidades ?? 999999);
    const porcentaje = semillas.descuento?.porcentaje ?? 0;
    const total = aplicaDescuento ? Number((precioBruto * (1 - porcentaje / 100)).toFixed(2)) : Number(precioBruto.toFixed(2));

    const nextId = Math.max(0, ...datos.ventas.map((v) => v.id)) + 1;
    const venta: Venta = {
      id: nextId,
      medicamentoId,
      clienteId,
      cantidad,
      total,
      descuentoAplicado: aplicaDescuento,
      estado: (semillas.estadoInicial as any) ?? "PENDIENTE",
    };

    // aplicar mutación: descontar disponibilidad
    medicamento.disponibles = Math.max(0, medicamento.disponibles - cantidad);
    datos.ventas.push(venta);
    return Promise.resolve({ ...venta });
  },
  anularVenta: async (id: number) => {
    const venta = datos.ventas.find((v) => v.id === id);
    if (!venta) return Promise.reject(new Error("Venta no encontrada"));
    if (venta.estado !== (semillas.estadoInicial as any)) return Promise.reject(new Error("Sólo se puede anular una venta en estado inicial"));
    const medicamento = datos.medicamentos.find((m) => m.id === venta.medicamentoId);
    if (medicamento) medicamento.disponibles += venta.cantidad;
    venta.estado = (semillas.estadoFinal as any) ?? "ANULADA";
    return Promise.resolve({ ...venta });
  },
};
