// @ts-check
// Exportar/Importar sessão em .json (Feature B — ver ADR 0011). Cobre:
// exportar baixa um arquivo com o conteúdo esperado (moduleKey/levelId/
// payload); reimportar o mesmo arquivo restaura o estado idêntico (isolado
// do autosave — localStorage limpo antes de importar); importar um arquivo
// de outra fase é bloqueado com erro, sem alterar o estado atual.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

async function goToAFD1(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

// L05 (L = { aⁿ | n > 0 }, alfabeto {a}, menor palavra "a") — mesma fixture
// dos specs de persistência de sessão do AFD.
async function openLevel(page, index = 0) {
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').nth(index).click();
  await page.locator('.word-input').waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function unlockBoard(page) {
  const wordInput = page.locator('.word-input');
  await wordInput.fill('a');
  await wordInput.press('Enter');
  await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });
}

test.describe('Exportar/Importar sessão (.json)', () => {

  test('exportar baixa um .json com moduleKey/levelId/payload corretos', async ({ page }) => {
    await goToAFD1(page);
    await openLevel(page, 0); // L05
    await unlockBoard(page);

    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await clickCanvasAt(page, 380, 150);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(2);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^turinglab_afd-p1_\d+_.+\.json$/);

    const filePath = await download.path();
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content.schemaVersion).toBe(1);
    expect(content.app).toBe('turinglab');
    expect(content.moduleKey).toBe('afd-p1');
    expect(content.payload.nodes).toHaveLength(2);
    expect(content.payload.isDrawingUnlocked).toBe(true);
  });

  test('importar o arquivo exportado restaura o estado idêntico (isolado do autosave)', async ({ page }) => {
    await goToAFD1(page);
    await openLevel(page, 0); // L05
    await unlockBoard(page);

    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await clickCanvasAt(page, 380, 150);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(2);
    await page.locator('.card[data-icon="↗"]').click();
    await nodes.nth(0).click();
    await nodes.nth(1).click();
    const chipInput = page.locator('.transition-chip-input');
    await chipInput.waitFor({ timeout: 4000 });
    await chipInput.fill('a');
    await chipInput.press('Enter');
    await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    // Isola o teste do autosave (Feature A, já coberta em
    // session_persistence_afd1.spec.js): limpa TODO o localStorage antes de
    // reabrir a fase, pra garantir que quem restaura o grafo aqui é o
    // IMPORT, não a sessão salva automaticamente.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await goToAFD1(page);
    await openLevel(page, 0); // mesma fase (L05), reaberta em branco
    await expect(page.locator('.locked-overlay')).toBeVisible();
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);

    // Importa o arquivo salvo — input de arquivo fica oculto (acessível
    // mesmo escondido, é um <input type="file"> padrão).
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
    await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 4000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
    await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toBeVisible();
  });

  test('importar arquivo de OUTRA fase é bloqueado, sem alterar o estado atual', async ({ page }) => {
    await goToAFD1(page);
    await openLevel(page, 0); // L05
    await unlockBoard(page);
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    // Vai pra OUTRA fase (2º nível disponível — levelId diferente) e tenta
    // importar o arquivo do L05 lá.
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await openLevel(page, 1);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0); // fase nova, em branco

    await page.locator('input[type="file"]').setInputFiles(filePath);

    await expect(page.locator('.toast-notification.error')).toContainText(/outra fase/i);
    // Estado da fase atual continua intacto (não aplicou nada do arquivo importado).
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);
  });

  // ─── Hardening: arquivo importado é input hostil (ver CLAUDE.md) ───────────
  test('importar um .json com HTML/script embutido numa palavra NUNCA executa — vira texto literal', async ({ page }) => {
    await goToAFD1(page);
    await openLevel(page, 0); // L05
    await unlockBoard(page); // testWords = [{ word: 'a', status: 'shortest' }]

    // Marcador global que só ficaria `true` se o payload malicioso fosse
    // interpretado como HTML/JS de verdade (em vez de texto escapado pelo
    // React) — ex.: um <img onerror=...> real disparando.
    await page.evaluate(() => { window.__xssFired = false; });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    const original = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const XSS_PAYLOAD = '<img src=x onerror="window.__xssFired = true">';
    const malicious = {
      ...original,
      payload: {
        ...original.payload,
        // Duas fontes de string plausíveis: uma palavra testada (chip de
        // texto) e um campo da Descrição Formal (input controlado).
        testWords: [{ word: XSS_PAYLOAD, status: 'wrong' }],
        formal: { ...original.payload.formal, inputQ: XSS_PAYLOAD },
      },
    };
    const maliciousFile = filePath.replace(/\.json$/, '_xss.json');
    fs.writeFileSync(maliciousFile, JSON.stringify(malicious));

    await page.locator('input[type="file"]').setInputFiles(maliciousFile);
    await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);

    // Nada executou — o onerror do <img> forjado nunca disparou.
    expect(await page.evaluate(() => window.__xssFired)).toBe(false);
    // Nenhum <img> real foi criado a partir do payload malicioso.
    await expect(page.locator('img[onerror]')).toHaveCount(0);

    // O texto aparece LITERALMENTE na tela (com os `<`/`>` mesmo), prova de
    // que o React escapou o conteúdo em vez de interpretá-lo como HTML.
    await expect(page.locator('.words-hint-chip.reject')).toContainText(XSS_PAYLOAD);

    // O campo da Descrição Formal (input controlado) também recebeu o texto
    // bruto, sem nenhuma interpretação especial.
    await page.locator('button.sidebar-toggle').click();
    await expect(page.locator('.formal-sidebar-content .form-group input').first()).toHaveValue(XSS_PAYLOAD);
  });

});
