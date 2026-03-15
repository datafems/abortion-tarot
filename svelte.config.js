import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

adapter: adapter({ strict: false }),

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    appDir: 'app',
    paths: {
      base: process.env.BASE_PATH || '',
    },
  },
};

export default config;