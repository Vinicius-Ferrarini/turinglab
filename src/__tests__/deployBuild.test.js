import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { validateDeployBuild } from '../../scripts/lib/validateDeployBuild.js';

const fixtures = [];
function buildFixture() {
  const distDir = mkdtempSync(join(tmpdir(), 'turinglab-deploy-'));
  fixtures.push(distDir);
  mkdirSync(join(distDir, 'assets'));
  mkdirSync(join(distDir, '.vite'));
  const manifest = {
    'index.html': { file: 'assets/index.js', isEntry: true, dynamicImports: ['src/level.js'], css: ['assets/style.css'] },
    'src/level.js': { file: 'assets/level.js', imports: ['_decimalMult.js'] },
    '_decimalMult.js': { file: 'assets/_decimalMult-hash.js' },
  };
  const files = {
    'index.html': '<script type="module" src="./assets/index.js"></script>',
    '.nojekyll': '',
    CNAME: 'teoriadacomputacao.com.br\n',
    'assets/index.js': '', 'assets/level.js': '', 'assets/_decimalMult-hash.js': '', 'assets/style.css': '',
    '.vite/manifest.json': JSON.stringify(manifest),
  };
  for (const [name, content] of Object.entries(files)) writeFileSync(join(distDir, name), content);
  return { distDir, expectedDomain: 'teoriadacomputacao.com.br', deployCommand: 'gh-pages -d dist --nojekyll --dotfiles' };
}

afterEach(() => {
  for (const path of fixtures.splice(0)) {
    const target = resolve(path);
    if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('turinglab-deploy-')) {
      throw new Error('Diretório temporário inesperado; limpeza cancelada.');
    }
    rmSync(target, { recursive: true, force: true });
  }
});

describe('proteção de publicação', () => {
  it('aceita chunks compartilhados iniciados por underscore quando a build está completa', () => {
    expect(validateDeployBuild(buildFixture())).toEqual({ assets: 4, domain: 'teoriadacomputacao.com.br' });
  });

  it.each(['.nojekyll', 'assets/_decimalMult-hash.js', 'assets/style.css', '.vite/manifest.json'])('bloqueia a ausência de %s', filename => {
    const options = buildFixture();
    rmSync(join(options.distDir, filename));
    expect(() => validateDeployBuild(options)).toThrow(`Arquivo ausente na build: ${filename}`);
  });

  it.each(['gh-pages -d dist', 'gh-pages -d dist --nojekyll', 'gh-pages -d dist --dotfiles'])('bloqueia configuração incompleta: %s', deployCommand => {
    expect(() => validateDeployBuild({ ...buildFixture(), deployCommand })).toThrow('--nojekyll --dotfiles');
  });

  it('bloqueia um domínio diferente', () => {
    expect(() => validateDeployBuild({ ...buildFixture(), expectedDomain: 'outro.example' })).toThrow('CNAME');
  });

  it('bloqueia uma dependência dinâmica ausente no manifesto', () => {
    const options = buildFixture();
    writeFileSync(join(options.distDir, '.vite/manifest.json'), JSON.stringify({
      'index.html': { file: 'assets/index.js', isEntry: true, dynamicImports: ['ausente.js'] },
    }));
    expect(() => validateDeployBuild(options)).toThrow('Import sem entrada no manifesto');
  });

  it('bloqueia HTML de uma build antiga', () => {
    const options = buildFixture();
    writeFileSync(join(options.distDir, 'index.html'), '<script src="./assets/antigo.js"></script>');
    expect(() => validateDeployBuild(options)).toThrow('entrada atual');
  });
});
