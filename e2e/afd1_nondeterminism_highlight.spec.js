// @ts-check
// AFD_1 — quando duas (ou mais) setas saem do MESMO estado com o MESMO
// símbolo (não-determinismo), os quadrados de rótulo de TODAS as setas
// conflitantes piscam (mesmo efeito visual de "seta sem símbolo ainda":
// .transition-label.error-pulse-severe) — a LINHA da seta em si nunca fica
// vermelha, só o quadrado onde fica a letra. Fixture via import de .json
// (mesmo padrão dos testes de MT) — mais direto que desenhar um auto-loop
// via drag-and-drop no canvas.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

async function goToAFD1(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

// L05 (L = { aⁿ | n > 0 }, id numérico 5) — 2 estados: q0(inicial) --a--> q1
// (final) E um auto-loop q0 --a--> q0 — DUAS setas de q0 com o MESMO símbolo 'a'.
const NODES = [
  { uid: 'q0', id: 'q0', label: 'q0', x: 700, y: 700, isInitial: true,  isFinal: false },
  { uid: 'q1', id: 'q1', label: 'q1', x: 1200, y: 700, isInitial: false, isFinal: true  },
];
const TRANSITIONS = [
  { from: 'q0', to: 'q1', symbol: 'a' },
  { from: 'q0', to: 'q0', symbol: 'a' }, // auto-loop — mesmo símbolo 'a' de q0
];

function buildSnapshot() {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'afd-p1',
    levelId: 5,
    savedAt: new Date().toISOString(),
    payload: {
      nodes: NODES,
      transitions: TRANSITIONS,
      testWords: [],
      isDrawingUnlocked: true,
      hintStage: 0,
      showVictoryScreen: false,
      showImpossibleScreen: false,
      formal: {},
    },
  };
}

async function importNondeterministicAFD(page) {
  const filePath = path.join(os.tmpdir(), `afd1_nondeterminism_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot()));

  await goToAFD1(page);
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').first().click(); // L05

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
  fs.unlinkSync(filePath);
}

test.describe('AFD_1 — destaque das setas conflitantes num não-determinismo', () => {

  test('as DUAS setas conflitantes piscam (quadrado do rótulo), a linha continua preta', async ({ page }) => {
    await importNondeterministicAFD(page);

    await page.getByRole('button', { name: /Validar Desenho do AFD/i }).click();
    await expect(page.locator('.toast-notification.error')).toContainText(/duas setas para o símbolo 'a'/i);

    // Os 2 rótulos (quadrado com a letra) piscam...
    const labels = page.locator('.transition-label');
    await expect(labels).toHaveCount(2);
    await expect(labels.nth(0)).toHaveClass(/error-pulse-severe/);
    await expect(labels.nth(1)).toHaveClass(/error-pulse-severe/);

    // ...mas NENHUMA linha de seta fica vermelha (line-error).
    const lines = page.locator('.transition-line');
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).not.toHaveClass(/line-error/);
    await expect(lines.nth(1)).not.toHaveClass(/line-error/);
  });

});
