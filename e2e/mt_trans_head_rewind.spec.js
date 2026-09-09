// @ts-check
// Regressão de ponta a ponta da mesma regra aplicada à Transdutora — ver
// docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md. Fixture sintética mínima (não há
// .json real do usuário pra este módulo): MT de 2 estados que aceita "0" no
// L16 (decimal ×2) e escreve a saída CERTA ("0"), mas move o cabeçote pra
// direita antes de parar em vez de ficar/recuar sobre o 1º caractere —
// isola a checagem de posição do cabeçote da checagem de conteúdo (já
// coberta em mt_trans_battery_precision.spec.js).
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
  { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true, isFinal: false },
  { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true },
];

function buildSnapshot(move) {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-trans',
    levelId: 'MT_L16',
    savedAt: new Date().toISOString(),
    payload: {
      nodes: NODES,
      // Aceita "0" (1º testWord de L16, alfabeto decimal) e escreve "0" —
      // saída correta (0×2=0). move:'R' não recua; move:'S' fica parado
      // (equivalente a já estar no 1º caractere, sem precisar recuar).
      transitions: [{ from: 'q0', to: 'q1', read: '0', write: '0', move }],
      linguagemTests: [],
      desenhoTests: [],
      activeTab: 'desenho',
      victory: false,
      formal: {},
    },
  };
}

async function importAndValidate(page, move) {
  const filePath = path.join(os.tmpdir(), `mt_trans_head_rewind_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot(move)));

  await goToMTTrans(page);
  await page.locator('.menu-btn.primary', { hasText: 'L16' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(2);

  await page.getByRole('button', { name: /Validar MT/i }).click();
  fs.unlinkSync(filePath);
}

test('L16: MT que aceita "0" e escreve certo mas NÃO recua o cabeçote — "✓ Validar MT" tem que reprovar', async ({ page }) => {
  await importAndValidate(page, 'R');

  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/cabeçote não volta/i);
  await expect(page.locator('.toast-notification.success')).toHaveCount(0);
});

test('L16: MT que aceita "0", escreve certo E já está no 1º caractere — "✓ Validar MT" (nesse ponto) não deve acusar cabeçote', async ({ page }) => {
  await importAndValidate(page, 'S');

  // Com só 1 transição a MT não cobre os outros testWords de L16 (ex.
  // "1","5",...), então "✓ Validar MT" ainda vai reprovar — mas por
  // REJECTED numa palavra seguinte, nunca por 'head-not-rewound' (prova
  // que o endurecimento não gera falso-positivo pra este caso específico).
  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).not.toContainText(/cabeçote não volta/i);
});

// ─── Aba "✏ Desenho" (lista de testes manuais) tem que refletir a mesma
// regra, não só "✓ Validar MT" — mesmo relato do usuário, aplicado à
// Transdutora. ────────────────────────────────────────────────────────────
async function importOnly(page, move) {
  const filePath = path.join(os.tmpdir(), `mt_trans_head_rewind_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot(move)));

  await goToMTTrans(page);
  await page.locator('.menu-btn.primary', { hasText: 'L16' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
  fs.unlinkSync(filePath);
}

test('L16 (aba Desenho): testar "0" numa MT que não recua mostra aviso dedicado, não a saída em verde', async ({ page }) => {
  await importOnly(page, 'R'); // snapshot já importa com activeTab:'desenho'

  await page.locator('.word-input').fill('0');
  await page.locator('.add-test-btn').first().click();

  await expect(page.getByText('⚠️ CABEÇOTE NÃO VOLTOU')).toBeVisible({ timeout: 4000 });
});

test('L16 (aba Desenho): testar "0" numa MT que já recua mostra a saída normalmente (sem falso-positivo)', async ({ page }) => {
  await importOnly(page, 'S');

  await page.locator('.word-input').fill('0');
  await page.locator('.add-test-btn').first().click();

  await expect(page.getByText('⚠️ CABEÇOTE NÃO VOLTOU')).toHaveCount(0);
  // Saída "0" aparece em negrito verde (célula da tabela de resultados).
  await expect(page.locator('table b', { hasText: '0' }).first()).toBeVisible({ timeout: 4000 });
});
