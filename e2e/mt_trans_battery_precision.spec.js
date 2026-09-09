// @ts-check
// Regressão de ponta a ponta da 2ª decisão de docs/PLAN_BATERIA_VALIDACAO_MT.md
// §3.2: "✓ Validar MT" da Transdutora agora tem que conferir a SAÍDA da fita,
// não só se a MT terminou em estado final. Antes do fix (tmAlgorithms.js
// fuzzTMTransducer), uma MT que aceita mas escreve qualquer coisa passava e
// ganhava ★★. Este spec prova isso pela UI real — monta uma MT minúscula
// (1 transição) que aceita a palavra vazia mas escreve "Z" em vez de deixar
// a fita vazia (esperado por level.validate('') no L01), via "⬆ Importar"
// (mesma técnica de mt_recon_battery_precision.spec.js).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadMTLevel } from '../src/levels_data/mt/index.js';

async function goToMTTrans(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Transdutora/i }).click();
}

function lastGraphStep(level) {
  const steps = level.guidedLesson.steps;
  const introIdx = steps.findIndex(s => s.formalIntro);
  return introIdx > 0 ? steps[introIdx - 1] : steps[steps.length - 1];
}

test('L01: MT que aceita mas escreve fita errada falha em "✓ Validar MT" (antes passava indevidamente)', async ({ page }) => {
  const level = await loadMTLevel('MT_L1');
  expect(level.validate('')).toBe(''); // sanidade: palavra vazia deveria produzir saída vazia

  // Grafo REAL do gabarito do L01 (todas as 4 testWords são estruturalmente
  // aceitas certinho — controle de estados intacto), com UMA mutação: a
  // transição usada só pra palavra vazia (q0->q5, lida no início da fita
  // ainda em branco) escreve "Z" em vez de deixar em branco. Isolado das
  // outras palavras de propósito: "ab"/"aabb"/"aaabbb" usam outra transição
  // pra chegar em q5 (q4->q5), nunca tocada aqui — continuam 100% corretas.
  // Antes do fix, fuzzTMTransducer só olhava "terminou em estado final?" —
  // essa MT sempre termina certo, então passava mesmo com "Z" sobrando.
  const graph = lastGraphStep(level).stateUpdate;
  const buggyGraph = {
    nodes: graph.nodes,
    transitions: graph.transitions.map(t =>
      (t.from === 'q0' && t.to === 'q5' && (t.read === '' || t.read === '□')) ? { ...t, write: 'Z' } : t
    ),
  };

  const snapshot = {
    schemaVersion: 1,
    app: 'turinglab',
    moduleKey: 'mt-trans',
    levelId: level.id,
    savedAt: new Date().toISOString(),
    payload: {
      nodes: buggyGraph.nodes,
      transitions: buggyGraph.transitions,
      linguagemTests: [],
      desenhoTests: [],
      activeTab: 'desenho',
      victory: false,
      formal: {},
    },
  };
  const filePath = path.join(os.tmpdir(), `mt_trans_l1_buggy_${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot));

  await goToMTTrans(page);
  await page.locator('.menu-btn.primary', { hasText: 'L01' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });

  await page.locator('input[type="file"]').setInputFiles(filePath);
  await expect(page.locator('.toast-notification.success')).toContainText(/importada/i);
  await expect(page.locator('.canvas-inner .node')).toHaveCount(buggyGraph.nodes.length);

  await page.getByRole('button', { name: /Validar MT/i }).click();

  // Antes do fix, fuzzTMTransducer só olhava o estado final — isto dava
  // "MT validada! ★★" mesmo escrevendo "Z" em vez de nada.
  const errorToast = page.locator('.toast-notification.error');
  await expect(errorToast).toBeVisible({ timeout: 4000 });
  await expect(errorToast).toContainText(/escreveu "Z"/i);
  await expect(errorToast).toContainText(/esperado era ""/i);
  await expect(page.locator('.toast-notification.success')).toHaveCount(0);

  fs.unlinkSync(filePath);
});
