// @ts-check
// "trace-on-failure" do AFD Parte 1 (mesmo espírito do AP — ver ADR 0010):
// sempre que a validação falha por causa de uma PALAVRA concreta, o painel
// "🔬 Simular" abre sozinho — carregado com essa palavra, no passo 1, e com um
// aviso no cabeçalho (ex.: '"aa" foi rejeitada — deveria ser aceita') — em vez
// de só um toast. Duas fontes de palavra:
//   • word_mismatch     — palavra que o aluno testou e o grafo errou;
//   • language_mismatch — contraexemplo do fuzzer de equivalência (o aluno pode
//                          nem ter testado essa palavra).
import { test, expect } from '@playwright/test';

async function goToAFD1(page) {
  await page.goto('/');
  // Fecha o banner de consentimento (sem aceitar) — senão ele intercepta
  // cliques no rodapé de cartas.
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

// Abre o L05 (L = { aⁿ | n > 0 }, alfabeto {a}, menor palavra "a"), destrava o
// tabuleiro e monta um AFD PROPOSITALMENTE errado: q0(inicial) --a--> q1(final),
// sem saída de q1. Aceita "a", mas rejeita "aa" — que a linguagem aceita.
async function unlockAndBuildWrongAFD(page) {
  await goToAFD1(page);
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').first().click(); // L05 (L01–L04 ocultos)

  const wordInput = page.locator('.word-input');
  await wordInput.waitFor({ timeout: 8000 });
  await wordInput.fill('a');
  await wordInput.press('Enter'); // descobre a menor palavra → destrava o tabuleiro
  await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });

  await page.locator('.card[data-icon="◯"]').click();  // "Novo Estado" → ADD_NODE
  await clickCanvasAt(page, 150, 150);                 // q0
  await clickCanvasAt(page, 360, 150);                // q1
  const nodes = page.locator('.canvas-inner .node');
  await expect(nodes).toHaveCount(2);

  await page.locator('.card[data-icon="▶"]').click();  // "Estado Inicial"
  await nodes.nth(0).click();
  await page.locator('.card[data-icon="◎"]').click();  // "Definir Final"
  await nodes.nth(1).click();

  await page.locator('.card[data-icon="↗"]').click();  // "Criar Seta" → CONNECTING
  await nodes.nth(0).click();
  await nodes.nth(1).click();                          // seta q0→q1 (sem símbolo)

  const chipInput = page.locator('.transition-chip-input'); // input do rótulo abre focado
  await chipInput.waitFor({ timeout: 4000 });
  await chipInput.fill('a');
  await chipInput.press('Enter');
  await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toBeVisible();

  return { wordInput };
}

test.describe('AFD_1 — simulação abre sozinha na palavra que falhou', () => {

  test('language_mismatch (sem testar a palavra): abre o SimPanel com aviso, no passo 1', async ({ page }) => {
    await unlockAndBuildWrongAFD(page);

    // Valida SEM testar "aa" antes → a falha vem do fuzzer de equivalência
    // (contraexemplo "aa"), não de uma palavra testada.
    await expect(page.locator('.word-row', { hasText: 'aa' })).toHaveCount(0);
    await page.getByRole('button', { name: /Validar Desenho do AFD/i }).click();

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-panel-title')).toContainText('aa');

    const note = sim.locator('.sim-mismatch-badge');
    await expect(note).toBeVisible();
    await expect(note).toContainText('aa');
    // q1 (final) não tem NENHUMA transição de saída → "aa" trava em q1 lendo
    // 'a' — δ incompleta de verdade, não só "estado errado no final". A nota
    // cita o estado e o símbolo exatos (ver Item 2 de
    // docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md), e o nó ganha destaque.
    await expect(note).toContainText(/δ incompleta.*"q1".*não tem transição para 'a'/i);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes.nth(1)).toHaveClass(/node-error/);

    // Começa no passo 1 (rastro do começo), NÃO no passo do erro.
    await expect(sim.locator('.sim-progress')).toHaveText('1 / 3');
    const step = sim.locator('.sim-panel-body .sim-current-step');
    await expect(step).toContainText(/Início em/i);
    await expect(step).not.toHaveClass(/error/);
  });

  test('word_mismatch (palavra testada) por δ incompleta: mesma nota/highlight, no passo 1', async ({ page }) => {
    const { wordInput } = await unlockAndBuildWrongAFD(page);

    // O aluno testa "aa" — a linguagem aceita, entra como "✓ aceita".
    await wordInput.fill('aa');
    await wordInput.press('Enter');
    await expect(page.locator('.word-row.correct', { hasText: 'aa' })).toBeVisible();

    await page.getByRole('button', { name: /Validar Desenho do AFD/i }).click();

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-mismatch-badge')).toContainText(/δ incompleta.*"q1".*não tem transição para 'a'/i);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes.nth(1)).toHaveClass(/node-error/);
    await expect(sim.locator('.sim-progress')).toHaveText('1 / 3');
    await expect(sim.locator('.sim-panel-body .sim-current-step')).toContainText(/Início em/i);
  });

  test('botão "🔬 Simular" manual: sem aviso, começando no passo inicial', async ({ page }) => {
    const { wordInput } = await unlockAndBuildWrongAFD(page);

    await wordInput.fill('a');
    await page.getByRole('button', { name: /🔬 Simular/i }).click();

    const sim = page.locator('.sim-panel-container');
    await expect(sim).toBeVisible({ timeout: 4000 });
    await expect(sim.locator('.sim-mismatch-badge')).toHaveCount(0);
    await expect(sim.locator('.sim-current-step.error')).toHaveCount(0);
    const step = sim.locator('.sim-panel-body .sim-current-step');
    await expect(step).toContainText(/Início em/i);
    await expect(step).not.toHaveClass(/error/);
  });

});
