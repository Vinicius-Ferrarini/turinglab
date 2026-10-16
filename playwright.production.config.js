import config from './playwright.config.js';

// Os mesmos fluxos são exercitados sobre dist, sem o servidor de desenvolvimento.
// A publicação externa e o comando de deploy permanecem independentes.
export default {
  ...config,
  testMatch: [
    'all_screens.spec.js', 'afd2_flow.spec.js', 'minimization_flow.spec.js',
    'boss_flow.spec.js', 'word_guess_flow.spec.js',
  ],
  use: { ...config.use, baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30000,
  },
};
