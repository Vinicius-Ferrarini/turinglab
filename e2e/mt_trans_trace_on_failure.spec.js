// @ts-check
// "trace-on-failure" da MT Transdutora (mesmo espírito do AFD/AP/MT
// Reconhecedora — ver ADR 0010 e e2e/mt_recon_trace_on_failure.spec.js):
// quando o "✓ Validar MT" falha por causa de uma PALAVRA concreta
// (contraexemplo de fuzzTMTransducer — loop / rejected / wrong-output /
// head-not-rewound), o MTSimPanel deve abrir sozinho já simulando essa
// palavra contra a MT do aluno, além do toast. Item 4 de
// docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md — MT Transdutora não tinha
// NENHUM wiring de simulador (nem manual, nem automático) até este item.
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

function buildSnapshot(nodes, transitions) {
  return {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-trans',
    levelId: 'MT_L16',
    savedAt: new Date().toISOString(),
    payload: {
      nodes, transitions,
      linguagemTests: [],
      desenhoTests: [],
      activeTab: 'desenho',
      victory: false,
      formal: {},
    },
  };
}

// Avança o MTSimPanel até o último passo (só tem ⏮/◀/▶, sem "ir pro fim").
async function advanceSimToEnd(page) {
  const next = page.locator('.sim-nav-btn').nth(2); // ⏮ ◀ ▶ (índice 2)
  for (let i = 0; i < 20; i++) {
    if (await next.isDisabled()) break;
    await next.click();
  }
}

async function importAndValidate(page, nodes, transitions) {
  const filePath = path.join(os.tmpdir(), `mt_trans_trace_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(buildSnapshot(nodes, transitions)));

  await goToMTTrans(page);
  await page.locator('.menu-btn.primary', { hasText: 'L16' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(nodes.length);
  fs.unlinkSync(filePath);

  await page.getByRole('button', { name: /Validar MT/i }).click();
}

test.describe('MT Transdutora — simulação abre sozinha na palavra que falhou', () => {

  test('loop: abre o MTSimPanel simulando o contraexemplo, com selo de LOOP', async ({ page }) => {
    const nodes = [
      { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true,  isFinal: false },
      { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true  },
    ];
    // Self-loop em q0 lendo '0': nunca sai do lugar, nunca chega em q1 → LOOP.
    const transitions = [{ from: 'q0', to: 'q0', read: '0', write: '0', move: 'S' }];
    await importAndValidate(page, nodes, transitions);

    const errorToast = page.locator('.toast-notification.error');
    await expect(errorToast).toBeVisible({ timeout: 4000 });
    await expect(errorToast).toContainText(/Loop detectado para "0"/i);

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-word-display')).toHaveText('0');
    await expect(sim.locator('.ap-simp-banner')).toContainText(/Loop detectado para "0"/i);
  });

  test('rejected: abre o MTSimPanel simulando o contraexemplo, com selo de REJEITADA', async ({ page }) => {
    // Tem inicial E final (passa as checagens estruturais), mas SEM NENHUMA
    // transição — trava de cara em q0 (não-final) ao ler '0'.
    const nodes = [
      { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true,  isFinal: false },
      { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true  },
    ];
    await importAndValidate(page, nodes, []);

    const errorToast = page.locator('.toast-notification.error');
    await expect(errorToast).toBeVisible({ timeout: 4000 });
    await expect(errorToast).toContainText(/Sua MT não aceita "0"/i);

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-word-display')).toHaveText('0');
    await expect(sim.locator('.ap-simp-banner')).toContainText(/Sua MT não aceita "0"/i);
  });

  test('wrong-output: abre o MTSimPanel simulando o contraexemplo, citando esperado/obtido', async ({ page }) => {
    const nodes = [
      { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true,  isFinal: false },
      { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true  },
    ];
    // Aceita "0" mas escreve "1" em vez de "0" (0×2=0 é o esperado).
    const transitions = [{ from: 'q0', to: 'q1', read: '0', write: '1', move: 'S' }];
    await importAndValidate(page, nodes, transitions);

    const errorToast = page.locator('.toast-notification.error');
    await expect(errorToast).toBeVisible({ timeout: 4000 });
    await expect(errorToast).toContainText(/sua MT escreveu "1".*esperado era "0"/i);

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-word-display')).toHaveText('0');
    await expect(sim.locator('.ap-simp-banner')).toContainText(/sua MT escreveu "1".*esperado era "0"/i);
  });

  test('head-not-rewound: abre o MTSimPanel simulando o contraexemplo, com selo dedicado', async ({ page }) => {
    const nodes = [
      { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true,  isFinal: false },
      { uid: 'q1', id: 'q1', label: 'q1', x: 4000, y: 3900, isInitial: false, isFinal: true  },
    ];
    // Aceita "0" e escreve certo, mas NÃO recua o cabeçote (move: 'R').
    const transitions = [{ from: 'q0', to: 'q1', read: '0', write: '0', move: 'R' }];
    await importAndValidate(page, nodes, transitions);

    const errorToast = page.locator('.toast-notification.error');
    await expect(errorToast).toBeVisible({ timeout: 4000 });
    await expect(errorToast).toContainText(/cabeçote não volta/i);

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-word-display')).toHaveText('0');
    await advanceSimToEnd(page);
    await expect(sim.getByText('⚠️ CABEÇOTE NÃO VOLTOU')).toBeVisible();
  });

  test('falha estrutural (sem estado final): só toast, sem abrir o painel', async ({ page }) => {
    // Só o inicial, NENHUM final — falha ANTES de fuzzTMTransducer rodar
    // (checagem estrutural em MTPart1.jsx, não em tmAlgorithms.js).
    const nodes = [
      { uid: 'q0', id: 'q0', label: 'q0', x: 3500, y: 3900, isInitial: true, isFinal: false },
    ];
    await importAndValidate(page, nodes, []);

    await expect(page.locator('.toast-notification.error')).toContainText(/estado final/i);
    await expect(page.locator('.sim-panel-container')).toHaveCount(0);
  });

});
