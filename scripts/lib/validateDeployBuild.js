import { readFileSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';

/** Confere o inventário gerado pelo Vite e as proteções de publicação no Pages. */
export function validateDeployBuild({ distDir, expectedDomain, deployCommand }) {
  const root = resolve(distDir);
  const requireFile = filename => {
    const target = resolve(root, filename);
    const rel = relative(root, target);
    if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
      throw new Error(`Arquivo fora da build: ${filename}`);
    }
    try {
      if (statSync(target).isFile()) return target;
    } catch { /* A mensagem abaixo identifica o arquivo ausente. */ }
    throw new Error(`Arquivo ausente na build: ${filename}`);
  };

  if (!/(?:^|\s)--nojekyll(?:\s|$)/.test(deployCommand)
      || !/(?:^|\s)--dotfiles(?:\s|$)/.test(deployCommand)) {
    throw new Error('O deploy deve usar --nojekyll --dotfiles para preservar arquivos iniciados por _ e o marcador .nojekyll.');
  }
  requireFile('index.html');
  requireFile('.nojekyll');
  const domain = readFileSync(requireFile('CNAME'), 'utf8').trim();
  if (!expectedDomain || domain !== expectedDomain) {
    throw new Error('O CNAME da build não corresponde ao domínio configurado em public/CNAME.');
  }
  const manifest = JSON.parse(readFileSync(requireFile('.vite/manifest.json'), 'utf8'));
  const entries = Object.values(manifest);
  if (!entries.length || !manifest['index.html']?.isEntry) {
    throw new Error('Manifesto sem a entrada index.html da aplicação.');
  }
  const assets = new Set();
  for (const [key, entry] of Object.entries(manifest)) {
    if (typeof entry.file !== 'string') throw new Error(`Entrada sem arquivo no manifesto: ${key}`);
    for (const filename of [entry.file, ...(entry.css || []), ...(entry.assets || [])]) {
      requireFile(filename);
      assets.add(filename);
    }
    for (const imported of [...(entry.imports || []), ...(entry.dynamicImports || [])]) {
      if (!Object.hasOwn(manifest, imported)) {
        throw new Error(`Import sem entrada no manifesto: ${key} → ${imported}`);
      }
    }
  }
  // Garante que o HTML não aponta para a entrada de uma build antiga.
  const html = readFileSync(requireFile('index.html'), 'utf8');
  if (!html.includes(manifest['index.html'].file)) {
    throw new Error('index.html não referencia a entrada atual do manifesto.');
  }
  return { assets: assets.size, domain };
}
