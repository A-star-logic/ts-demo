<template>
  <div
    class="progression-box"
    v-if="
      pipelineStore.buildSearchesLoading || pipelineStore.buildSearchesResponse
    "
  >
    <h2>Searching for:</h2>
    <div v-if="true" class="progression-block">
      <div class="with-icon" v-if="pipelineStore.buildSearchesLoading">
        <Icon name="eos-icons:loading" class="icon" />
        Loading...
      </div>
      <div class="progression-line">
        <div
          v-for="proposition of pipelineStore.buildSearchesResponse
            ?.proposedSearches"
          class="proposition"
        >
          <Icon name="fa-solid:search" class="icon" />
          {{ proposition }}
        </div>
      </div>

      <div class="with-icon" v-if="pipelineStore.searchResultsLoading">
        <Icon name="eos-icons:loading" class="icon" />
        Loading...
      </div>
      <div class="with-icon" v-if="pipelineStore.searchResults">
        <Icon name="fa-solid:check-circle" class="icon" />
        Found {{ pipelineStore.searchResults.length }} results
      </div>
    </div>

    <template v-if="pipelineStore.searchResults">
      <h2>Filtering the results</h2>
      <div v-if="true || true" class="progression-block">
        <div class="with-icon" v-if="pipelineStore.filteredLoading">
          <Icon name="eos-icons:loading" class="icon" />
          Loading...
        </div>
        <div class="with-icon" v-if="pipelineStore.relevantDocuments">
          <Icon name="fa-solid:check-circle" class="icon" />
          Kept {{ pipelineStore.relevantDocuments?.length }} document
        </div>
      </div>
    </template>

    <template v-if="pipelineStore.relevantDocuments">
      <h2>Generating a summary</h2>
      <div class="progression-block">
        <div class="reading">
          <div class="with-icon" v-if="pipelineStore.summariesLoading">
            <Icon name="eos-icons:loading" class="icon" />
            Reading the documents...
          </div>
          <div class="with-icon" v-if="pipelineStore.summaries">
            <Icon name="fa-solid:check-circle" class="icon" />
            Reading the documents...
          </div>
          <div class="with-icon" v-if="pipelineStore.responseLoading">
            <Icon name="eos-icons:loading" class="icon" />
            Wrapping up...
          </div>
          <div class="with-icon" v-if="pipelineStore.response">
            <Icon name="fa-solid:check-circle" class="icon" />
            Wrapping up...
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// stores
import { usePipelineStore } from '../stores/app-stores-pipeline';

const pipelineStore = usePipelineStore();
</script>

<style scoped>
h2 {
  font-weight: bold;
  @apply text-zinc-600 pt-1;
}

.progression-box {
  display: flex;
  flex-direction: column;
  width: 80ch;
  @apply gap-1 border-zinc-300 border rounded-xl p-4 text-zinc-500;
}

.progression-block {
  display: flex;
  flex-direction: column;
  @apply gap-1 pl-5;
}

.progression-line {
  display: flex;
  flex-wrap: wrap;
  @apply gap-2 p-1;
}

.proposition {
  display: flex;
  align-items: center;
  @apply gap-1 rounded-2xl px-2 py-1 bg-zinc-200;
}

.icon {
  @apply w-4 h-4 text-base;
}

.with-icon {
  display: flex;
  align-items: center;
  @apply gap-1;
}
</style>
