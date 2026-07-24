import type { FuenteDatos } from "./contrato";
const pendiente = () => Promise.reject(new Error("no implementado"));

export const fuenteApi: FuenteDatos = {
  listarMedicamentos: pendiente,
  listarClientes: pendiente,
  crearCliente: pendiente,
  listarVentas: pendiente,
  crearVenta: pendiente,
  anularVenta: pendiente,
};
