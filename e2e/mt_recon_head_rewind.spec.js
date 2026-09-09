// @ts-check
// Regressão de ponta a ponta do bug relatado: MT Reconhecedora L06 aceitava
// "ab" mesmo com o cabeçote fora do 1º caractere da palavra ao parar em
// estado final — ver docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md. Fixtures são
// os 2 grafos reais que o usuário exportou (um incompleto, um corrigido por
// ele mesmo) — mesmos nodes/transitions usados em
// mt_recon_levels.test.js (describe "cabeçote tem que voltar ao 1º
// caractere"), aqui testados pela UI de ponta a ponta via "⬆ Importar"
// (mesma técnica de mt_recon_battery_precision.spec.js).
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

const BASE_NODES = [
  { uid: 'q0', id: 'q0', label: 'q0', x: 268, y: 258, isInitial: true, isFinal: false },
  { uid: 'q1', id: 'q1', label: 'q1', x: 586, y: 151, isInitial: false, isFinal: false },
  { uid: 'q2', id: 'q2', label: 'q2', x: 833, y: 226, isInitial: false, isFinal: false },
  { uid: 'q3', id: 'q3', label: 'q3', x: 605, y: 395, isInitial: false, isFinal: false },
];

const BASE_TRANSITIONS = [
  { from: 'q0', to: 'q1', read: 'a', write: 'A', move: 'R' },
  { from: 'q0', to: 'q3', read: 'b', write: 'B', move: 'R' },
  { from: 'q1', to: 'q2', read: 'b', write: 'B', move: 'L' },
  { from: 'q2', to: 'q0', read: '', write: '', move: 'R' },
  { from: 'q2', to: 'q2', read: 'a', write: 'a', move: 'L' },
  { from: 'q2', to: 'q2', read: 'b', write: 'b', move: 'L' },
  { from: 'q2', to: 'q2', read: 'A', write: 'A', move: 'L' },
  { from: 'q2', to: 'q2', read: 'B', write: 'B', move: 'L' },
  { from: 'q3', to: 'q2', read: 'a', write: 'A', move: 'L' },
  { from: 'q0', to: 'q4', read: '', write: '', move: 'L' },
  { from: 'q0', to: 'q0', read: 'A', write: 'A', move: 'R' },
  { from: 'q0', to: 'q0', read: 'B', write: 'B', move: 'R' },
  { from: 'q1', to: 'q1', read: 'a', write: 'a', move: 'R' },
  { from: 'q1', to: 'q1', read: 'B', write: 'B', move: 'R' },
  { from: 'q3', to: 'q3', read: 'b', write: 'b', move: 'R' },
  { from: 'q3', to: 'q3', read: 'A', write: 'A', move: 'R' },
];

// Grafo real do usuário (arquivo "incorreto"): q4 é final direto, sem
// recuar o cabeçote — aceita "ab" mas termina fora do 1º caractere.
const NOT_REWOUND_NODES = [
  ...BASE_NODES,
  { uid: 'q4', id: 'q4', label: 'q4', x: 397, y: 514, isInitial: false, isFinal: true },
];

// Grafo real do usuário (arquivo "corrigido"): q4 deixa de ser final, ganha
// os self-loops de varredura (A/B, move L) e um novo q5 (final) só
// alcançado depois de recuar até o branco antes do 1º caractere.
const REWOUND_NODES = [
  ...BASE_NODES,
  { uid: 'q4', id: 'q4', label: 'q4', x: 397, y: 514, isInitial: false, isFinal: false },
  { uid: 'q5', id: 'q5', label: 'q5', x: 611, y: 527, isInitial: false, isFinal: true },
];
const REWOUND_TRANSITIONS = [
  ...BASE_TRANSITIONS,
  { from: 'q4', to: 'q5', read: '', write: '', move: 'R' },
  { from: 'q4', to: 'q4', read: 'A', write: 'A', move: 'L' },
  { from: 'q4', to: 'q4', read: 'B', write: 'B', move: 'L' },
];

function buildSnapshot(nodes, transitions) {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-recon',
    levelId: 'MT_RECON_L6',
    savedAt: new Date().toISOString(),
    payload: {
      nodes, transitions,
      testedWords: [{ word: 'ab', mode: 'LANGUAGE', status: 'shortest' }],
      isDrawingUnlocked: true,
      hintStage: 1,
      testMode: 'DRAWING',
      victory: false,
      formal: { formalAnswers: {}, formalElementsValid: false },
    },
  };
}

async function importAndValidate(page, nodes, transitions) {
  const filePath = path.join(os.tmpdir(), `mt_recon_head_rewind_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot(nodes, transitions)));

  await goToMTRecon(page);
  await page.locator('.menu-btn.primary', { hasText: 'L06' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(nodes.length);

  await page.getByRole('button', { name: /Validar MT/i }).click();
  fs.unlinkSync(filePath);
}

test('L06 (grafo real do usuário): aceita "ab" mas NÃO recua o cabeçote — "✓ Validar MT" tem que reprovar', async ({ page }) => {
  await importAndValidate(page, NOT_REWOUND_NODES, BASE_TRANSITIONS);

  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/cabeçote não volta/i);
  await expect(page.locator('.toast-notification.success')).toHaveCount(0);
});

test('L06 (grafo corrigido pelo usuário): aceita "ab" E recua o cabeçote — "✓ Validar MT" tem que aprovar', async ({ page }) => {
  await importAndValidate(page, REWOUND_NODES, REWOUND_TRANSITIONS);

  await expect(page.locator('.toast-notification.success')).toContainText(/MT validada/i);
  await expect(page.locator('.toast-notification.error')).toHaveCount(0);
});
