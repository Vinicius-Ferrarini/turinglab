// @ts-check
// Persistência de sessão por fase (AFD Parte 1) — ver ADR 0011. Cobre: grafo
// (mesmo estruturalmente incompleto) sobrevive a reload; histórico de
// palavras testadas; "descubra a menor palavra" (tabuleiro destravado);
// Descrição Formal parcialmente preenchida; sair pro Menu e voltar (sem
// reload); e a limpeza da sessão ao vencer + "Voltar ao Menu".
import { test, expect } from '@playwright/test';

async function goToAFD1(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

// L05 (L = { aⁿ | n > 0 }, alfabeto {a}, menor palavra "a") — 1º nível
// disponível (L01–L04 ocultos), mesma fixture de afd1_trace_on_failure.spec.js.
async function openL05(page) {
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').first().click();
  await page.locator('.word-input').waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function unlockBoard(page) {
  const wordInput = page.locator('.word-input');
  await wordInput.fill('a');
  await wordInput.press('Enter');
  await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });
}

// O autosave é debounced (~500ms) — espera passar do debounce antes de
// recarregar, senão o reload pode acontecer ANTES da escrita em localStorage.
async function waitAutosave(page) {
  await page.waitForTimeout(700);
}

test.describe('AFD_1 — persistência de sessão por fase', () => {

  test('grafo parcial e estruturalmente incompleto sobrevive a page.reload()', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page);

    // 2 estados, SEM definir inicial/final, com 1 transição — propositalmente
    // incompleto (nunca validar antes de salvar, ver ADR 0011).
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await clickCanvasAt(page, 380, 150);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(2);

    await page.locator('.card[data-icon="↗"]').click();
    await nodes.nth(0).click();
    await nodes.nth(1).click();
    const chipInput = page.locator('.transition-chip-input');
    await chipInput.waitFor({ timeout: 4000 });
    await chipInput.fill('a');
    await chipInput.press('Enter');
    await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toBeVisible();

    await waitAutosave(page);
    await page.reload();
    await goToAFD1(page);
    await page.locator('.menu-btn.primary:not([disabled])').first().click();

    await expect(page.locator('.canvas-inner .node')).toHaveCount(2, { timeout: 8000 });
    await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toBeVisible();
    // Continua sem inicial/final — nada foi "corrigido" ao restaurar.
    await expect(page.locator('.canvas-inner .node.initial')).toHaveCount(0);
    await expect(page.locator('.canvas-inner .node.final')).toHaveCount(0);
  });

  test('histórico de palavras testadas sobrevive a page.reload()', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    const wordInput = page.locator('.word-input');
    await wordInput.fill('a');  await wordInput.press('Enter'); // menor → destrava
    // Destravar tem um delay proposital (~900ms, segura a linha vencedora
    // visível na grade) — só depois disso a grade para de exigir o mesmo
    // tamanho da menor palavra pras próximas tentativas.
    await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });
    await wordInput.fill('aa'); await wordInput.press('Enter'); // válida
    await wordInput.fill('aaa'); await wordInput.press('Enter'); // válida
    await expect(page.locator('.word-row')).toHaveCount(3);

    await waitAutosave(page);
    await page.reload();
    await goToAFD1(page);
    await page.locator('.menu-btn.primary:not([disabled])').first().click();

    await expect(page.locator('.word-row')).toHaveCount(3, { timeout: 8000 });
  });

  test('"descubra a menor palavra" continua destravado após reload', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page);
    await expect(page.locator('.locked-overlay')).toHaveCount(0);

    await waitAutosave(page);
    await page.reload();
    await goToAFD1(page);
    await page.locator('.menu-btn.primary:not([disabled])').first().click();

    await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Validar Desenho do AFD/i })).toBeVisible();
  });

  test('Descrição Formal parcialmente preenchida sobrevive a reload', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page);

    await page.locator('button.sidebar-toggle').click();
    const formalInputs = page.locator('.formal-sidebar-content .form-group input');
    await formalInputs.nth(0).fill('q0');      // Q — só 1 estado, incompleto de propósito
    await formalInputs.nth(2).fill('q0');      // q0 — estado inicial

    await waitAutosave(page);
    await page.reload();
    await goToAFD1(page);
    await page.locator('.menu-btn.primary:not([disabled])').first().click();
    await page.locator('button.sidebar-toggle').click();

    const restoredInputs = page.locator('.formal-sidebar-content .form-group input');
    await expect(restoredInputs.nth(0)).toHaveValue('q0');
    await expect(restoredInputs.nth(2)).toHaveValue('q0');
  });

  test('sair para o Menu e reabrir a mesma fase mantém o grafo (sem reload)', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page);
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await page.locator('.menu-btn.primary:not([disabled])').first().click();

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
  });

  test('vencer a fase NÃO limpa mais nada — "Acessar Tabuleiro"/"Limpar Fase" controlam isso (ADR 0012)', async ({ page }) => {
    await goToAFD1(page);
    await openL05(page);
    await unlockBoard(page);

    // AFD correto: q0(inicial) -a-> q1(final), q1 -a-> q1 (self-loop)
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 150, 150);
    await clickCanvasAt(page, 400, 150);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(2);

    await page.locator('.card[data-icon="▶"]').click();
    await nodes.nth(0).click();
    await page.locator('.card[data-icon="◎"]').click();
    await nodes.nth(1).click();

    await page.locator('.card[data-icon="↗"]').click();
    await nodes.nth(0).click();
    await nodes.nth(1).click();
    let chipInput = page.locator('.transition-chip-input');
    await chipInput.waitFor({ timeout: 4000 });
    await chipInput.fill('a');
    await chipInput.press('Enter');

    // Sem reclicar o card "↗": o modo CONNECTING já continua ativo depois da
    // 1ª transição (reclicar o card já selecionado alternaria pra IDLE).
    await nodes.nth(1).click();
    await nodes.nth(1).click(); // self-loop q1 -> q1
    chipInput = page.locator('.transition-chip-input');
    await chipInput.waitFor({ timeout: 4000 });
    await chipInput.fill('a');
    await chipInput.press('Enter');
    await expect(page.locator('.transition-chip', { hasText: /^a$/ })).toHaveCount(2);

    await page.getByRole('button', { name: /Validar Desenho do AFD/i }).click();

    const formalInputs = page.locator('.formal-sidebar-content .form-group input');
    await expect(formalInputs.first()).toBeVisible({ timeout: 4000 });
    await formalInputs.nth(0).fill('{q0, q1}');
    await formalInputs.nth(1).fill('a');
    await formalInputs.nth(2).fill('q0');
    await formalInputs.nth(3).fill('q1');
    await page.getByRole('button', { name: /Validar Elementos/i }).click();

    const tableInputs = page.locator('.transition-table input');
    await expect(tableInputs).toHaveCount(2, { timeout: 4000 });
    await tableInputs.nth(0).fill('q1');
    await tableInputs.nth(1).fill('q1');
    await page.getByRole('button', { name: /Validar Transições/i }).click();

    // EndScreen tem os 4 botões (ADR 0012): Voltar ao Menu, Exportar,
    // Acessar Tabuleiro, Próxima (mensagem varia por nível — verifica pelos
    // botões, não pelo texto, que é level-specific).
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 4000 });
    // "⬇ Exportar" existe 2x na tela agora (GameHeader por baixo + EndScreen
    // por cima) — a da EndScreen é a última no DOM.
    await expect(page.getByRole('button', { name: /⬇ Exportar/i }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: /🎮 Acessar Tabuleiro/i })).toBeVisible();

    // Clicar "Voltar ao Menu" SEM passar por "Acessar Tabuleiro" NÃO limpa
    // nada — reabrir a mesma fase reabre a EndScreen de novo, com o grafo intacto.
    await waitAutosave(page); // debounce do autosave (~500ms) — showVictoryScreen precisa ter sido persistido
    await page.getByRole('button', { name: /Voltar ao Menu/i }).click();
    await page.locator('.menu-btn.primary:not([disabled])').first().click();
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(2);

    // "🎮 Acessar Tabuleiro" fecha o overlay SEM navegar nem limpar — o
    // grafo continua lá e o GameHeader (Limpar Fase) fica acessível.
    await page.getByRole('button', { name: /🎮 Acessar Tabuleiro/i }).click();
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(2);
    const clearBtn = page.getByRole('button', { name: /Limpar Fase/i });
    await expect(clearBtn).toBeVisible();

    // Essa escolha (dispensar sem limpar) também persiste: reabrir a fase
    // depois vai direto pro tabuleiro, sem reabrir a EndScreen.
    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await page.locator('.menu-btn.primary:not([disabled])').first().click();
    await expect(page.locator('.canvas-inner .node')).toHaveCount(2, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);

    // "🗑 Limpar Fase" (confirmação Sim) é a única coisa que de fato limpa.
    await page.getByRole('button', { name: /Limpar Fase/i }).click();
    await page.getByRole('button', { name: /^Sim$/i }).click();
    await expect(page.getByText('Fase limpa!')).toBeVisible();
    await expect(page.locator('.locked-overlay')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);
  });

});
