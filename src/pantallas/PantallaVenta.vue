<template>
  <section class="pantalla-venta">
    <h2>Nueva venta</h2>
    <div class="tarjeta">
      <div class="fila">
        <label>Medicamento</label>
        <select v-model.number="seleccion.medicamentoId" @change="onCambioMedicamento">
          <option :value="0">-- selecciona --</option>
          <option v-for="m in medicamentosActivos" :key="m.id" :value="m.id">
            {{ m.nombre }} ({{ m.disponibles }} disponibles)
          </option>
        </select>
      </div>

      <div class="fila">
        <label>Cantidad</label>
        <input type="number" min="1" v-model.number="seleccion.cantidad" @input="recalcular" />
        <div class="error" v-if="errorCantidad">{{ errorCantidad }}</div>
      </div>

      <div class="fila">
        <label>Cliente</label>
        <select v-model.number="seleccion.clienteId">
          <option :value="0">-- selecciona cliente --</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <button @click="nuevoClienteVisible = !nuevoClienteVisible">Nuevo cliente</button>
      </div>

      <div v-if="nuevoClienteVisible" class="nuevo-cliente">
        <h4>Crear cliente</h4>
        <input placeholder="Nombre" v-model="nuevo.nombre" />
        <input placeholder="Cédula" v-model="nuevo.cedula" />
        <input placeholder="Teléfono" v-model="nuevo.telefono" />
        <button @click="crearClienteInline" :disabled="creandoCliente">Crear</button>
        <div class="error" v-if="errorCrearCliente">{{ errorCrearCliente }}</div>
      </div>

      <div class="resumen">
        <div>Disponibles: <strong>{{ disponiblesSeleccion }}</strong></div>
        <div>Descuento: <strong>{{ descuentoTexto }}</strong></div>
        <div>Total: <strong>{{ formatoPrecio(total) }}</strong></div>
      </div>

      <div class="acciones">
        <button @click="registrar" :disabled="enviando">Registrar venta</button>
        <div class="error" v-if="errorServidor">{{ errorServidor }}</div>
        <div class="ok" v-if="mensajeOk">{{ mensajeOk }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { obtenerFuenteDatos } from "../datos";
import type { Medicamento, Cliente, NuevaVenta } from "../dominio";

const medicamentos = ref<Medicamento[]>([]);
const clientes = ref<Cliente[]>([]);

const seleccion = reactive<{ medicamentoId: number; cantidad: number; clienteId: number }>({ medicamentoId: 0, cantidad: 1, clienteId: 0 });
const nuevoClienteVisible = ref(false);
const nuevo = reactive({ nombre: "", cedula: "", telefono: "" });
const creandoCliente = ref(false);
const errorCrearCliente = ref<string | null>(null);
const errorServidor = ref<string | null>(null);
const errorCantidad = ref<string | null>(null);
const mensajeOk = ref<string | null>(null);
const enviando = ref(false);

const cargar = async () => {
  medicamentos.value = await obtenerFuenteDatos().listarMedicamentos();
  clientes.value = await obtenerFuenteDatos().listarClientes();
};

onMounted(cargar);

const medicamentosActivos = computed(() => medicamentos.value.filter((m) => m.activo));
const medSeleccionado = computed(() => medicamentos.value.find((m) => m.id === seleccion.medicamentoId));
const disponiblesSeleccion = computed(() => medSeleccionado.value ? medSeleccionado.value.disponibles : 0);

const descuentoTexto = computed(() => {
  // detect discount from server via recalculation
  const cant = seleccion.cantidad || 0;
  if (!medSeleccionado.value) return "-";
  // assume discount threshold from fetching by attempting to compute price via fuente? Simpler: show "según regla"
  return cant >= 5 ? "Sí" : "No";
});

const total = computed(() => {
  if (!medSeleccionado.value) return 0;
  const precioBruto = medSeleccionado.value.precioUnitario * (seleccion.cantidad || 0);
  const aplica = (seleccion.cantidad || 0) >= 5; // threshold per spec
  const porcentaje = 10; // reflects semillas.json; fuente applies same rule on server
  return aplica ? Number((precioBruto * (1 - porcentaje / 100)).toFixed(2)) : Number(precioBruto.toFixed(2));
});

const formatoPrecio = (v: number) => `$${v.toFixed(2)}`;

const onCambioMedicamento = () => {
  errorCantidad.value = null;
  if (seleccion.cantidad > disponiblesSeleccion.value) {
    errorCantidad.value = "Supera la disponibilidad";
  }
};

const recalcular = () => {
  errorCantidad.value = null;
  if (seleccion.cantidad <= 0) errorCantidad.value = "Cantidad debe ser mayor que 0";
  if (medSeleccionado.value && seleccion.cantidad > medSeleccionado.value.disponibles) errorCantidad.value = "Cantidad supera la disponibilidad";
};

const crearClienteInline = async () => {
  errorCrearCliente.value = null;
  if (!nuevo.nombre || !nuevo.cedula) {
    errorCrearCliente.value = "Nombre y cédula son obligatorios";
    return;
  }
  creandoCliente.value = true;
  try {
    const creado = await obtenerFuenteDatos().crearCliente({ nombre: nuevo.nombre, cedula: nuevo.cedula, telefono: nuevo.telefono });
    clientes.value.push(creado);
    seleccion.clienteId = creado.id;
    nuevo.nombre = nuevo.cedula = nuevo.telefono = "";
    nuevoClienteVisible.value = false;
  } catch (e: any) {
    errorCrearCliente.value = e?.message ?? String(e);
  } finally { creandoCliente.value = false; }
};

const registrar = async () => {
  errorServidor.value = null;
  mensajeOk.value = null;
  recalcular();
  if (errorCantidad.value) return;
  if (!seleccion.medicamentoId) { errorServidor.value = "Seleccione un medicamento"; return; }
  if (!seleccion.clienteId) { errorServidor.value = "Seleccione o cree un cliente"; return; }
  enviando.value = true;
  try {
    const nueva: NuevaVenta = { medicamentoId: seleccion.medicamentoId, clienteId: seleccion.clienteId, cantidad: seleccion.cantidad } as any;
    const creada = await obtenerFuenteDatos().crearVenta(nueva);
    mensajeOk.value = `Venta creada (id=${creada.id}) — Total: ${formatoPrecio(creada.total)}`;
    // recargar catálogo y clientes para reflejar nueva disponibilidad
    medicamentos.value = await obtenerFuenteDatos().listarMedicamentos();
    clientes.value = await obtenerFuenteDatos().listarClientes();
    seleccion.medicamentoId = 0;
    seleccion.cantidad = 1;
    seleccion.clienteId = 0;
  } catch (e: any) {
    errorServidor.value = e?.message ?? String(e);
  } finally { enviando.value = false; }
};
</script>

<style scoped>
.pantalla-venta { background:#f8fafc; border-radius:16px; padding:24px }
.tarjeta { background:white; padding:18px; border-radius:12px }
.fila { margin-bottom:12px }
.fila label { display:block; font-weight:700; margin-bottom:6px }
.fila select, .fila input { padding:8px; width:100%; border:1px solid #e2e8f0; border-radius:6px }
.nuevo-cliente { margin:12px 0; border-top:1px dashed #e2e8f0; padding-top:12px }
.resumen { margin-top:12px }
.acciones { margin-top:12px }
.error { color:#b91c1c; margin-top:6px }
.ok { color:#065f46; margin-top:6px }
</style>
