// @ts-check
// MT Transdutora — não-determinismo (2 regras para o mesmo estado+símbolo)
// já mostra a mensagem certa (estado+símbolo exatos), mas não acendia
// NENHUM destaque visual no canvas (ver Item 3 de
// docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md). Fixture sintética via import
// de .json (mesmo padrão de mt_trans_head_rewind.spec.js) — mais direto que
// desenhar 2 setas conflitantes no canvas via drag-and-drop.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

async function goToMTTrans(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Transdutora/i }).click();
}

const NODES = [
  { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true,  isFinal: false },
  { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true  },
];

// Duas regras para (q0, lendo '0') com destinos/escrita diferentes — mesmo
// (from,read), sig diferente → não-determinística.
const TRANSITIONS = [
  { from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' },
  { from: 'q0', to: 'q0', read: '0', write: '1', move: 'R' },
];

function buildSnapshot() {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-trans',
    levelId: 'MT_L16',
    savedAt: new Date().toISOString(),
    payload: {
      nodes: NODES,
      transitions: TRANSITIONS,
      linguagemTests: [],
      desenhoTests: [],
      activeTab: 'desenho',
      victory: false,
      formal: {},
    },
  };
}

test('MT Transdutora: não-determinismo destaca o estado certo no canvas (errorNodeIds)', async ({ page }) => {
  const filePath = path.join(os.tmpdir(), `mt_trans_nondeterminism_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot()));

  await goToMTTrans(page);
  await page.locator('.menu-btn.primary', { hasText: 'L16' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
  fs.unlinkSync(filePath);

  await page.getByRole('button', { name: /Validar MT/i }).click();

  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/duas regras diferentes para o símbolo "0"/i);

  // q0 (1º nó do snapshot) é o estado conflitante — tem que ganhar destaque.
  const nodes = page.locator('.canvas-inner .node');
  await expect(nodes.nth(0)).toHaveClass(/error-pulse-severe/);
  await expect(nodes.nth(1)).not.toHaveClass(/error-pulse-severe/);
});
