import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDeployBuild } from './lib/validateDeployBuild.js';

const projectFile = path => fileURLToPath(new URL(path, import.meta.url));
try {
  const pkg = JSON.parse(readFileSync(projectFile('../package.json'), 'utf8'));
  const result = validateDeployBuild({
    distDir: projectFile('../dist/'),
    expectedDomain: readFileSync(projectFile('../public/CNAME'), 'utf8').trim(),
    deployCommand: pkg.scripts.deploy,
  });
  console.log(`Build conferida: ${result.assets} arquivos, domínio ${result.domain}, .nojekyll presente e publicação com --nojekyll --dotfiles.`);
} catch (error) {
  console.error(`Publicação bloqueada: ${error.message}`);
  process.exitCode = 1;
}
