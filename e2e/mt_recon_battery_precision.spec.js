// @ts-check
// Regressão de ponta a ponta do bug relatado: MT Reconhecedora L06 sem os
// auto-loops "pular mais um símbolo igual" (equivalentes a q2->q2(b;b,R)/
// q2->q2(A;A,R)/q3->q3(b;b,L) no gabarito oficial) passava em "✓ Validar MT"
// mesmo travando pra palavras como "bbaa" (deveria aceitar — 2 a's, 2 b's).
// Corrigido em docs/PLAN_BATERIA_VALIDACAO_MT.md §3.1 adicionando "bbaa" a
// acceptedWords. Este spec prova o fix pela UI de ponta a ponta (não só a
// função pura fuzzTMRecognizer, já coberta em mt_recon_levels.test.js) —
// monta o grafo "incompleto" via Importar (mesma infraestrutura de
// exportação/importação de sessão, ADR 0011) em vez de clicar 19 transições
// no canvas, e confirma que "✓ Validar MT" agora acusa o erro.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadMTReconLevel } from '../src/levels_data/mt-recon/index.js';

async function goToMTRecon(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Reconhecedora/i }).click();
}

function lastGraphStep(level) {
  const steps = level.guidedLesson.steps;
  const introIdx = steps.findIndex(s => s.formalIntro);
  return introIdx > 0 ? steps[introIdx - 1] : steps[steps.length - 1];
}

// As 3 transições que o autômato do usuário estava faltando (nomes
// equivalentes no gabarito oficial — ver docs/PLAN_BATERIA_VALIDACAO_MT.md §2).
const MISSING = [
  { from: 'q2', to: 'q2', read: 'b', write: 'b', move: 'R' },
  { from: 'q2', to: 'q2', read: 'A', write: 'A', move: 'R' },
  { from: 'q3', to: 'q3', read: 'b', write: 'b', move: 'L' },
];

test('L06: autômato oficial sem os 3 auto-loops relatados falha em "✓ Validar MT" (antes passava indevidamente)', async ({ page }) => {
  const level = await loadMTReconLevel('MT_RECON_L6');
  const graph = lastGraphStep(level).stateUpdate;
  const isMissing = (t) => MISSING.some(m => m.from === t.from && m.to === t.to && m.read === t.read && m.write === t.write && m.move === t.move);
  const buggyTransitions = graph.transitions.filter(t => !isMissing(t));
  expect(buggyTransitions.length).toBe(graph.transitions.length - MISSING.length);

  const snapshot = {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-recon',
    levelId: level.id,
    savedAt: new Date().toISOString(),
    payload: {
      nodes: graph.nodes,
      transitions: buggyTransitions,
      testedWords: [],
      isDrawingUnlocked: true,
      hintStage: 0,
      testMode: 'DRAWING',
      victory: false,
      formal: { formalAnswers: {}, formalElementsValid: false },
    },
  };
  const filePath = path.join(os.tmpdir(), `mt_recon_l6_buggy_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot));

  await goToMTRecon(page);
  await page.locator('.menu-btn.primary', { hasText: 'L06' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(graph.nodes.length);

  await page.getByRole('button', { name: /Validar MT/i }).click();

  // Antes do fix (bbaa fora de acceptedWords), isto dava sucesso ("MT
  // validada! ★★") mesmo com o autômato incompleto — o bug relatado.
  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/não aceita "bbaa"/i);
  await expect(page.locator('.toast-notification.success')).toHaveCount(0);

  fs.unlinkSync(filePath);
});
