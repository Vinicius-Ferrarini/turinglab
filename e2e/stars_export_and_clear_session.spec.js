// @ts-check
// Estrelas no export/import + "🗑 Limpar Fase" (ADR 0012). Complementa os
// testes já reescritos em session_persistence_*.spec.js (CA5/CA7 —
// "vencer a fase NÃO limpa mais nada"). Este spec cobre CA1/CA2/CA4/CA6
// especificamente. CA3 (import não gera telemetria de fim_fase falsa) NÃO
// tem cobertura E2E aqui — não existe infraestrutura de mock de rede pro
// Firebase neste repo (as chamadas reais falham no ambiente de teste, ver
// FirebaseError nos logs do webServer), e criar uma só pra este caso seria
// desproporcional; coberto por revisão de código (App.jsx: `if
// (!logTelemetry) return;` antes do logEvent, trivialmente visível).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

async function goToAFD1(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

async function openL05(page) {
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').first().click();
  await page.locator('.word-input').waitFor({ timeout: 8000 });
}

async function unlockBoard(page) {
  const wordInput = page.locator('.word-input');
  await wordInput.fill('a');
  await wordInput.press('Enter');
  await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });
}

async function waitAutosave(page) {
  await page.waitForTimeout(700);
}

// Lê o único progresso salvo em localStorage (cada teste começa com storage
// limpo — só há a fase que o teste tocou).
async function readSingleProgressStars(page) {
  return page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('turinglab_progress') || '{}');
    const entries = Object.values(progress);
    return entries.length ? entries[0].stars : 0;
  });
}

test.describe('Estrelas no export/import + Limpar Fase (ADR 0012)', () => {

  test('CA1: exportar inclui as estrelas atuais da fase', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page); // ★1 (descoberta da menor palavra)

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    expect(content.stars).toBe(1);
  });

  test('CA2: importar restaura as estrelas SEM regredir', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page); // ★1

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    const original = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(original.stars).toBe(1);

    // Caso 1 — arquivo com MAIS estrelas (3) que a fase atual (1): sobe pra 3.
    const higherStarsFile = path.join(path.dirname(filePath), 'higher_stars.json');
    fs.writeFileSync(higherStarsFile, JSON.stringify({ ...original, stars: 3 }));
    await page.locator('input[type="file"]').setInputFiles(higherStarsFile);
    await expect(page.getByText('Fase importada com sucesso!')).toBeVisible();
    expect(await readSingleProgressStars(page)).toBe(3);

    // Caso 2 — arquivo com MENOS estrelas (0) que a fase atual (agora 3):
    // updateProgress nunca regride — continua em 3.
    const lowerStarsFile = path.join(path.dirname(filePath), 'lower_stars.json');
    fs.writeFileSync(lowerStarsFile, JSON.stringify({ ...original, stars: 0 }));
    await page.locator('input[type="file"]').setInputFiles(lowerStarsFile);
    await expect(page.getByText('Fase importada com sucesso!')).toBeVisible();
    expect(await readSingleProgressStars(page)).toBe(3);
  });

  test('CA4: arquivo exportado ANTES desta mudança (sem campo stars) continua importável', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page); // ★1

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /⬇ Exportar/i }).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    const withStars = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Simula um arquivo da Feature B original (Fase B, antes da ADR 0012):
    // mesmo envelope, sem a chave `stars` de jeito nenhum.
    const legacy = { ...withStars };
    delete legacy.stars;
    const legacyFile = path.join(path.dirname(filePath), 'legacy_no_stars.json');
    fs.writeFileSync(legacyFile, JSON.stringify(legacy));

    await page.locator('input[type="file"]').setInputFiles(legacyFile);
    await expect(page.getByText('Fase importada com sucesso!')).toBeVisible();
    // Sem erro de import, e as estrelas continuam como estavam (1, do
    // unlockBoard local) — o campo ausente não derruba nem zera nada.
    expect(await readSingleProgressStars(page)).toBe(1);
  });

  test('CA6: "🗑 Limpar Fase" apaga o grafo mas NUNCA as estrelas', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page); // ★1
    await page.locator('.card[data-icon="◯"]').click();
    await page.locator('.canvas-inner').click({ position: { x: 150, y: 150 } });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);
    await waitAutosave(page);

    expect(await readSingleProgressStars(page)).toBe(1);

    const clearBtn = page.getByRole('button', { name: /Limpar Fase/i });
    await clearBtn.click();
    // "Não" não muda nada.
    await page.getByRole('button', { name: /^Não$/i }).click();
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await clearBtn.click();
    await page.getByRole('button', { name: /^Sim$/i }).click();
    await expect(page.getByText('Fase limpa!')).toBeVisible();
    await expect(page.locator('.locked-overlay')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);

    // A estrela conquistada antes de limpar continua lá.
    expect(await readSingleProgressStars(page)).toBe(1);
  });

});
