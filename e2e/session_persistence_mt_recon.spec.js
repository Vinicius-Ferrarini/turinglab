// @ts-check
// Persistência de sessão por fase (MT Reconhecedora) — ver ADR 0011. Mesma
// cobertura do AFD_1/AP, adaptada à UI da MT (editor de tripla read/write/move
// em popup — TMTransitionEditor.jsx — e Descrição Formal já no orquestrador).
import { test, expect } from '@playwright/test';

async function goToMTRecon(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Reconhecedora/i }).click();
}

// L1 = { aⁿbⁿ / n ≥ 0 } — menor jogável "ab" (λ é a menor de verdade, mas não
// cabe na grade). Mesma fixture de mt_recon_menor_palavra_grid.spec.js.
async function openL1(page) {
  await page.locator('.menu-btn.primary:not([disabled])').first().click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function unlockBoard(page) {
  const wordInput = page.locator('.word-input');
  await wordInput.waitFor({ timeout: 8000 });
  await wordInput.fill('ab');
  await page.locator('.add-test-btn').first().click();
  await page.getByRole('button', { name: /Validar MT/i }).waitFor({ timeout: 8000 });
}

async function waitAutosave(page) {
  await page.waitForTimeout(700);
}

test.describe('MT Reconhecedora — persistência de sessão por fase', () => {

  test('grafo parcial (sem estado final definido) sobrevive a page.reload()', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);
    await unlockBoard(page);

    // 1 estado, SEM definir final, com 1 tripla — propositalmente incompleto
    // (nunca validar antes de salvar, ver ADR 0011).
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 200, 180);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(1);
    await page.locator('.card[data-icon="▶"]').click();
    await nodes.nth(0).click();

    await page.locator('.card[data-icon="↗"]').click();
    await nodes.nth(0).click();
    await nodes.nth(0).click(); // self-loop
    const editor = page.locator('.tm-transition-editor');
    await editor.waitFor({ timeout: 4000 });
    await page.waitForTimeout(50);
    await editor.locator('.tm-te-input').nth(0).fill('a');
    await editor.locator('.tm-te-ok').click();
    await expect(page.locator('.tm-tl-chip')).toBeVisible();

    await waitAutosave(page);
    await page.reload();
    await goToMTRecon(page);
    await openL1(page);

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('.tm-tl-chip')).toBeVisible();
    await expect(page.locator('.canvas-inner .node.final')).toHaveCount(0);
  });

  test('histórico de palavras testadas (aba Linguagem) sobrevive a reload', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);

    const wordInput = page.locator('.word-input');
    await wordInput.fill('ab');   await page.locator('.add-test-btn').first().click(); // menor → destrava
    await page.getByRole('button', { name: /Validar MT/i }).waitFor({ timeout: 8000 });
    await wordInput.fill('aabb'); await page.locator('.add-test-btn').first().click();
    await wordInput.fill('ba');   await page.locator('.add-test-btn').first().click();
    await expect(page.locator('.word-row')).toHaveCount(3);

    await waitAutosave(page);
    await page.reload();
    await goToMTRecon(page);
    await openL1(page);

    await expect(page.locator('.word-row')).toHaveCount(3, { timeout: 8000 });
  });

  test('"descubra a menor palavra" continua destravado após reload', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);
    await unlockBoard(page);

    await waitAutosave(page);
    await page.reload();
    await goToMTRecon(page);
    await openL1(page);

    await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Validar MT/i })).toBeVisible();
  });

  test('Descrição Formal parcialmente preenchida sobrevive a reload', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);
    await unlockBoard(page);

    await page.locator('.card[data-icon="◯"]').click(); // precisa de 1 nó pra ter linha na tabela δ
    await clickCanvasAt(page, 200, 180);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();
    const formalInputs = page.locator('.formal-panel input');
    await formalInputs.nth(0).fill('{q0}');  // Q — incompleto de propósito
    await formalInputs.nth(3).fill('q0');    // q0 inicial

    await waitAutosave(page);
    await page.reload();
    await goToMTRecon(page);
    await openL1(page);
    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();

    const restoredInputs = page.locator('.formal-panel input');
    await expect(restoredInputs.nth(0)).toHaveValue('{q0}');
    await expect(restoredInputs.nth(3)).toHaveValue('q0');
  });

  test('sair para o Menu e reabrir a mesma fase mantém o grafo (sem reload)', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);
    await unlockBoard(page);
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 200, 180);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await openL1(page);

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
  });

  test('vencer a fase NÃO limpa mais nada — "Acessar Tabuleiro"/"Limpar Fase" controlam isso (ADR 0012)', async ({ page }) => {
    await goToMTRecon(page);
    await openL1(page);
    await unlockBoard(page);

    // Gabarito oficial do L1 (mesma máquina de src/levels_data/mt-recon/L1.js
    // — formalFill.delta do guidedLesson), 6 estados q0..q5, q5 final.
    const ROWS = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'];
    const COLS = ['a', 'b', 'A', 'B', '□'];
    const TRANSITIONS = [
      { from: 'q3', to: 'q4', read: '',  write: '',  move: 'L' },
      { from: 'q1', to: 'q2', read: 'b', write: 'B', move: 'L' },
      { from: 'q0', to: 'q3', read: 'B', write: 'B', move: 'R' },
      { from: 'q2', to: 'q2', read: 'a', write: 'a', move: 'L' },
      { from: 'q2', to: 'q2', read: 'B', write: 'B', move: 'L' },
      { from: 'q4', to: 'q4', read: 'A', write: 'A', move: 'L' },
      { from: 'q4', to: 'q4', read: 'B', write: 'B', move: 'L' },
      { from: 'q0', to: 'q5', read: '',  write: '',  move: 'R' },
      { from: 'q1', to: 'q1', read: 'a', write: 'a', move: 'R' },
      { from: 'q1', to: 'q1', read: 'B', write: 'B', move: 'R' },
      { from: 'q3', to: 'q3', read: 'B', write: 'B', move: 'R' },
      { from: 'q2', to: 'q0', read: 'A', write: 'A', move: 'R' },
      { from: 'q0', to: 'q1', read: 'a', write: 'A', move: 'R' },
      { from: 'q4', to: 'q5', read: '',  write: '',  move: 'R' },
    ];

    // Grade 2×3 bem espaçada (não 1 fileira) — com 14 transições, os chips
    // (posicionados sobre a aresta) crescem e podem cobrir nós vizinhos
    // demais numa fileira única, interceptando cliques de nós posteriores.
    const POSITIONS = [[150, 130], [420, 130], [690, 130], [150, 380], [420, 380], [690, 380]];
    await page.locator('.card[data-icon="◯"]').click();
    for (const [x, y] of POSITIONS) {
      await clickCanvasAt(page, x, y);
    }
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(6);
    await page.locator('.card[data-icon="▶"]').click();
    await nodes.nth(0).click(); // q0 inicial
    await page.locator('.card[data-icon="◎"]').click();
    await nodes.nth(5).click(); // q5 final

    await page.locator('.card[data-icon="↗"]').click();
    for (const t of TRANSITIONS) {
      const fromIdx = ROWS.indexOf(t.from), toIdx = ROWS.indexOf(t.to);
      // Clica perto da BASE do nó (não no centro), usando o boundingBox real
      // (não um offset fixo — a posição em px na tela depende do zoom):
      // chips de self-loop (e de arestas que passam perto) tendem a ficar
      // ancorados por cima do nó — com 14 transições em 6 estados, o centro
      // do nó fica coberto e um clique ali acaba indo pro chip por cima, não
      // pro nó (achado ao depurar este spec: cliques "funcionavam" sem erro
      // mas criavam a tripla errada, porque na real acertavam um chip
      // existente por cima do nó).
      const clickNode = async (n) => {
        const box = await nodes.nth(n).boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
      };
      await clickNode(fromIdx);
      await clickNode(toIdx);
      const editor = page.locator('.tm-transition-editor');
      await editor.waitFor({ timeout: 4000 });
      // Mesma corrida do auto-foco (~20ms) já documentada no spec do AP.
      await page.waitForTimeout(50);
      const inputs = editor.locator('.tm-te-input');
      if (t.read)  await inputs.nth(0).fill(t.read);
      if (t.write) await inputs.nth(1).fill(t.write);
      await editor.locator('.tm-te-move', { hasText: t.move }).click();
      await editor.locator('.tm-te-ok').click();
    }
    await expect(page.locator('.tm-tl-chip')).toHaveCount(TRANSITIONS.length);

    await page.getByRole('button', { name: /Validar MT/i }).click();

    const formalInputs = page.locator('.formal-panel input');
    await expect(formalInputs.first()).toBeVisible({ timeout: 4000 });
    await formalInputs.nth(0).fill('{q0,q1,q2,q3,q4,q5}'); // Q
    await formalInputs.nth(1).fill('{a,b}');               // Sigma
    await formalInputs.nth(2).fill('{A,B,a,b,□}');         // Gamma
    await formalInputs.nth(3).fill('q0');                  // q0
    await formalInputs.nth(4).fill('□');                   // branco
    await formalInputs.nth(5).fill('q5');                  // F — 1 só elemento, sem { }
    await page.getByRole('button', { name: /Validar Elementos/i }).click();

    const deltaInputs = page.locator('.mt-formal-delta-input');
    await expect(deltaInputs).toHaveCount(ROWS.length * COLS.length, { timeout: 4000 });
    for (const t of TRANSITIONS) {
      const row = ROWS.indexOf(t.from);
      const col = COLS.indexOf(t.read === '' ? '□' : t.read);
      const value = `${t.to}, ${t.write === '' ? '□' : t.write}, ${t.move}`;
      await deltaInputs.nth(row * COLS.length + col).fill(value);
    }
    await page.getByRole('button', { name: /Validar Transições/i }).click();

    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 4000 });
    await expect(page.getByRole('button', { name: /⬇ Exportar/i }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: /🎮 Acessar Tabuleiro/i })).toBeVisible();

    // Clicar "Voltar ao Menu" SEM passar por "Acessar Tabuleiro" NÃO limpa
    // nada — reabrir a mesma fase reabre a EndScreen de novo, com o grafo intacto.
    await waitAutosave(page);
    await page.getByRole('button', { name: /Voltar ao Menu/i }).click();
    await openL1(page);
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(6);

    // "🎮 Acessar Tabuleiro" fecha o overlay SEM navegar nem limpar.
    await page.getByRole('button', { name: /🎮 Acessar Tabuleiro/i }).click();
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(6);
    await expect(page.getByRole('button', { name: /Limpar Fase/i })).toBeVisible();

    // Essa escolha persiste: reabrir a fase depois vai direto pro tabuleiro.
    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await openL1(page);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(6, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);

    // "🗑 Limpar Fase" (confirmação Sim) é a única coisa que de fato limpa.
    await page.getByRole('button', { name: /Limpar Fase/i }).click();
    await page.getByRole('button', { name: /^Sim$/i }).click();
    await expect(page.getByText('Fase limpa!')).toBeVisible();
    await expect(page.locator('.locked-overlay')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);
  });

});
