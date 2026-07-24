// ARCHIVO BLOQUEADO — NO MODIFICAR
// ============================================================================
// CONTRATO DE LA CAPA DE DATOS — Temática: FARMACIA
// ----------------------------------------------------------------------------
// Las tres fuentes de datos (memoria, json, api) implementan ESTA interfaz.
// El resto de la aplicación consume la fuente sin saber cuál hay detrás.
//
// Los tipos se importan desde src/dominio: usted debe definirlos ahí,
// derivándolos de las pantallas. Este archivo compila contra sus nombres.
// ============================================================================
import type {
  Medicamento,
  Cliente,
  NuevoCliente,
  Venta,
  NuevaVenta,
} from "../dominio";

export interface FuenteDatos {
  /** Catálogo completo, incluidos los registros inactivos. */
  listarMedicamentos(): Promise<Medicamento[]>;

  /** Todos los clientes registrados. */
  listarClientes(): Promise<Cliente[]>;

  /** Crea un cliente y lo devuelve con su id asignado. */
  crearCliente(datos: NuevoCliente): Promise<Cliente>;

  /** Todas las transacciones, en cualquier estado. */
  listarVentas(): Promise<Venta[]>;

  /**
   * Crea una transacción aplicando las reglas de negocio observables en las
   * pantallas: el registro debe estar activo y el cliente existir; la cantidad
   * no puede superar la disponibilidad; el total lleva descuento desde 5
   * unidades; y al crear se descuenta la disponibilidad.
   * Ante una regla incumplida, rechaza la promesa con un Error descriptivo.
   */
  crearVenta(datos: NuevaVenta): Promise<Venta>;

  /**
   * Acción "Anular": solo se permite en el estado inicial (PENDIENTE,
   * pasa a ANULADA) y, al aplicarla, repone la disponibilidad. Devuelve el
   * registro actualizado.
   * Ante una regla incumplida, rechaza la promesa con un Error descriptivo.
   */
  anularVenta(id: number): Promise<Venta>;
}
