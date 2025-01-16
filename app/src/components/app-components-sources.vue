<template>
  <div class="wrapper" v-if="pipelineStore.response">
    <h2>Sources</h2>
    <div class="sources">
      <div class="source" v-for="source of pipelineStore.sources">
        <a :href="source" target="_blank" class="source-link">
          <Icon name="system-uicons:chain" class="icon" />
          {{ source }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// stores
import { usePipelineStore } from '../stores/app-stores-pipeline';

const pipelineStore = usePipelineStore();
</script>

<style lang="css" scoped>
h2 {
  font-weight: bold;
  @apply text-zinc-600 pt-1;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @apply p-2;
}

.sources {
  display: flex;
  flex-wrap: wrap;
  width: 80ch;
  @apply m-2 gap-2;
}

.source-link {
  display: flex;
  align-items: center;
  text-decoration: underline;
  @apply rounded-2xl px-2 py-1 bg-zinc-200;
}
</style>
