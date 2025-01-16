import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'src/',
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nitro-cloudflare-dev',
    '@nuxt/icon',
  ],
  nitro: {
    preset: 'cloudflare-pages',
  },

  runtimeConfig: {
    memoireKey: process.env.MEMOIRE_API_KEY,
    memoireUrl: process.env.MEMOIRE_URL,
    openAIKey: process.env.OPENAI_KEY,
    openAIChatURl: process.env.OPENAI_CHAT_URL,
  },
});
