export interface Medicamento {
  id: number;
  nombre: string;
  precioUnitario: number;
  disponibles: number;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
}

export type NuevoCliente = Omit<Cliente, "id">;

export interface Venta {
  id: number;
  medicamentoId: number;
  clienteId: number;
  cantidad: number;
  total: number;
  descuentoAplicado: boolean;
  estado: "PENDIENTE" | "DESPACHADA" | "ANULADA";
}

export type NuevaVenta = Omit<Venta, "id" | "total" | "descuentoAplicado">;
