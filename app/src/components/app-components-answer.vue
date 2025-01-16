<template>
  <div class="answer" v-if="pipelineStore.response">
    <h2>Answer</h2>
    <div v-html="markdownTranspiler.render(pipelineStore.response)" />
  </div>
</template>

<script setup lang="ts">
// libs
import MarkdownIt from 'markdown-it';

// stores
import { usePipelineStore } from '../stores/app-stores-pipeline';

const pipelineStore = usePipelineStore();

const markdownTranspiler = new MarkdownIt({
  html: true,
  typographer: true,
});
</script>

<style lang="css" scoped>
h2 {
  font-weight: bold;
  @apply text-zinc-600 pt-1 text-lg;
}

.answer {
  width: 80ch;
  @apply m-8;
}
</style>
