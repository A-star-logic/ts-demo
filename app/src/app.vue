<template>
  <div class="main">
    <componentInput />
    <componentProgression />
    <componentSources />
    <componentAnswer />
  </div>
</template>

<script setup lang="ts">
// components
import componentAnswer from './components/app-components-answer.vue';
import componentInput from './components/app-components-input.vue';
import componentProgression from './components/app-components-progression.vue';
import componentSources from './components/app-components-sources.vue';
</script>

<style lang="css" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  @apply container mx-auto;
}
</style>
