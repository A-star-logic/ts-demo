<template>
  <form class="input-box" @submit.prevent="runPipeline()">
    <input v-model="input" type="" placeholder="Ask anything..." />
  </form>
</template>

<script setup lang="ts">
// libs
import { ref } from 'vue';

// stores
import { usePipelineStore } from '../stores/app-stores-pipeline';

const pipelineStore = usePipelineStore();
const input = ref<string>('');

/**
 * Reset the pipeline and run it
 */
async function runPipeline(): Promise<void> {
  pipelineStore.$reset();
  await pipelineStore.runPipeline({ query: input.value });
}
</script>

<style lang="css" scoped>
form {
  display: flex;
  width: 50%;
  @apply p-8;
}

input {
  display: flex;
  @apply text-xl p-4 rounded-xl border-zinc-300 border w-full outline-zinc-300;
}
</style>
