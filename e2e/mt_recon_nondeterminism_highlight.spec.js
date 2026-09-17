// @ts-check
// MT Reconhecedora — não-determinismo (2 regras para o mesmo estado+símbolo)
// já mostra a mensagem certa (estado+símbolo exatos), mas não tinha NENHUM
// destaque visual no canvas até este item (nem o estado, nem a transição —
// diferente da MT Transdutora, que já ganhou o destaque do estado num item
// anterior). Fixture sintética via import de .json (mesmo padrão de
// mt_recon_head_rewind.spec.js).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

async function goToMTRecon(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Reconhecedora/i }).click();
}

const NODES = [
  { uid: 'q0', id: 'q0', label: 'q0', x: 300, y: 300, isInitial: true,  isFinal: false },
  { uid: 'q1', id: 'q1', label: 'q1', x: 700, y: 300, isInitial: false, isFinal: true  },
];

// Duas regras para (q0, lendo 'a') com destinos/escrita diferentes — mesmo
// (from,read), sig diferente → não-determinística.
const TRANSITIONS = [
  { from: 'q0', to: 'q1', read: 'a', write: 'a', move: 'R' },
  { from: 'q0', to: 'q0', read: 'a', write: 'A', move: 'R' },
];

function buildSnapshot() {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-recon',
    levelId: 'MT_RECON_L6',
    savedAt: new Date().toISOString(),
    payload: {
      nodes: NODES,
      transitions: TRANSITIONS,
      testedWords: [],
      isDrawingUnlocked: true,
      hintStage: 1,
      testMode: 'DRAWING',
      victory: false,
      formal: {},
    },
  };
}

async function importAndValidate(page) {
  const filePath = path.join(os.tmpdir(), `mt_recon_nondeterminism_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot()));

  await goToMTRecon(page);
  await page.locator('.menu-btn.primary', { hasText: 'L06' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
  fs.unlinkSync(filePath);

  await page.getByRole('button', { name: /Validar MT/i }).click();
}

test('MT Reconhecedora: não-determinismo destaca o estado E as regras conflitantes', async ({ page }) => {
  await importAndValidate(page);

  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/duas regras diferentes para o símbolo "a"/i);

  // q0 (1º nó) é o estado conflitante.
  const nodes = page.locator('.canvas-inner .node');
  await expect(nodes.nth(0)).toHaveClass(/error-pulse-severe/);
  await expect(nodes.nth(1)).not.toHaveClass(/error-pulse-severe/);

  // As 2 regras conflitam entre si — os 2 chips piscam.
  const labels = page.locator('.tm-transition-label');
  await expect(labels).toHaveCount(2);
  await expect(labels.nth(0)).toHaveClass(/error-pulse-severe/);
  await expect(labels.nth(1)).toHaveClass(/error-pulse-severe/);
});
