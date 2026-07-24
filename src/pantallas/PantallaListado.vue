<template>
  <section class="pantalla-listado">
    <h2>Catálogo de medicamentos</h2>
    <div class="tarjeta">
      <table>
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Precio</th>
            <th>Disponibles</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="medicamento in medicamentos" :key="medicamento.id">
            <td>{{ medicamento.nombre }}</td>
            <td>{{ formatoPrecio(medicamento.precioUnitario) }}</td>
            <td>{{ medicamento.disponibles }}</td>
            <td>
              <span :class="['estado', medicamento.activo ? 'activo' : 'inactivo']">
                {{ medicamento.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { obtenerFuenteDatos } from "../datos";
import type { Medicamento } from "../dominio";

const medicamentos = ref<Medicamento[]>([]);

const cargarMedicamentos = async () => {
  medicamentos.value = await obtenerFuenteDatos().listarMedicamentos();
};

onMounted(cargarMedicamentos);

const formatoPrecio = (valor: number) => `$${valor.toFixed(2)}`;
</script>

<style scoped>
.pantalla-listado {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.pantalla-listado h2 {
  margin: 0 0 18px;
  font-size: 1.25rem;
  color: #0f172a;
}

.tarjeta {
  background: white;
  border-radius: 12px;
  padding: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  font-weight: 600;
  color: #334155;
}

.estado {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.activo {
  background: #dcfce7;
  color: #166534;
}

.inactivo {
  background: #e2e8f0;
  color: #475569;
}
</style>
