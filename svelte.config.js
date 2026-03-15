import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    appDir: 'abortion-tarot', // avoids the underscore issue with GitHub Pages
    paths: {
      base: process.env.BASE_PATH || '',
    },
  },
};


export default config;
