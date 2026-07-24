<template>
  <div class="app-contenedor">
    <header class="cabecera">
      <div>
        <h1>Farmacia San Rafael</h1>
        <p class="subtitulo">Sistema de ventas</p>
      </div>
      <div class="fuente-activa">Fuente activa: <strong>{{ fuenteActiva }}</strong></div>
    </header>

    <main>
      <nav class="nav-acciones">
        <button @click="vista = 'list'" :class="{ active: vista==='list' }">Listado</button>
        <button @click="vista = 'venta'" :class="{ active: vista==='venta' }">Nueva venta</button>
      </nav>

      <section>
        <PantallaListado v-if="vista === 'list'" />
        <PantallaVenta v-else-if="vista === 'venta'" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import PantallaListado from "./pantallas/PantallaListado.vue";
import PantallaVenta from "./pantallas/PantallaVenta.vue";
import { FUENTE_ACTIVA } from "./datos";

const fuenteActiva = FUENTE_ACTIVA;
import { ref } from "vue";
const vista = ref<"list" | "create">("list");
</script>

<style scoped>
.app-contenedor {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: Arial, sans-serif;
  color: #1c1e21;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1f2937;
  color: #f8fafc;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.cabecera h1 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitulo {
  margin: 4px 0 0;
  color: #cbd5e1;
}

.fuente-activa {
  font-size: 0.95rem;
}

.nav-acciones { display:flex; gap:10px; margin-bottom:18px }
.nav-acciones button { padding:8px 12px; border-radius:8px; border:0; background:#e2e8f0 }
.nav-acciones button.active { background:#0f172a; color:white }
</style>
