// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  server: {
    host: "127.0.0.1"
  },
  output: "static",
  integrations: [react()],
  base: "./"
});