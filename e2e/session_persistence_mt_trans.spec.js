// @ts-check
// Persistência de sessão por fase (MT Transdutora) — ver ADR 0011. Mesma
// cobertura dos demais módulos, adaptada à UI da MT Transdutora: SEM a
// mecânica "descubra a menor palavra" (isDrawingUnlocked é sempre true — ver
// CLAUDE.md), e com DUAS baterias de teste independentes (abas
// Linguagem/Desenho — linguagemTests/desenhoTests) + activeTab.
import { test, expect } from '@playwright/test';

async function goToMTTrans(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
  await page.getByRole('button', { name: /Transdutora/i }).click();
}

// L2 (complemento bit-a-bit, 3 estados/6 transições — bem menor que L1) para
// o teste de vitória; os demais testes usam o 1º nível disponível (L1),
// mesmo padrão dos specs irmãos.
async function openL1(page) {
  await page.locator('.menu-btn.primary').first().click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
}
async function openL2(page) {
  await page.locator('.menu-btn.primary', { hasText: 'L02' }).click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function waitAutosave(page) {
  await page.waitForTimeout(700);
}

test.describe('MT Transdutora — persistência de sessão por fase', () => {

  test('grafo parcial (sem estado final definido) sobrevive a page.reload()', async ({ page }) => {
    await goToMTTrans(page);
    await openL1(page);

    // 1 estado, SEM definir final, com 1 tripla — propositalmente incompleto
    // (nunca validar antes de salvar, ver ADR 0011). MT-Trans não tem a fase
    // de "descubra a menor palavra" — o canvas já nasce destravado.
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
    await goToMTTrans(page);
    await openL1(page);

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('.tm-tl-chip')).toBeVisible();
    await expect(page.locator('.canvas-inner .node.final')).toHaveCount(0);
  });

  test('histórico das DUAS abas (Linguagem/Desenho) e a aba ativa sobrevivem a reload', async ({ page }) => {
    await goToMTTrans(page);
    await openL1(page);

    const wordInput = page.locator('.word-input');
    // Aba Linguagem (default) — gabarito estático.
    await wordInput.fill('ab'); await page.locator('.add-test-btn').first().click();
    await expect(page.locator('.words-list')).toContainText('ab');

    // Aba Desenho — simulador do grafo do aluno (vazio agora, mas testa igual).
    await page.getByRole('button', { name: /✏ Desenho/i }).click();
    await wordInput.fill('ba'); await page.locator('.add-test-btn').first().click();
    await expect(page.locator('.words-list')).toContainText('ba');

    await waitAutosave(page);
    await page.reload();
    await goToMTTrans(page);
    await openL1(page);

    // Restaura na aba Desenho (última ativa antes do reload) — a lista já
    // mostra "ba" sem precisar clicar na aba de novo.
    await expect(page.locator('.words-list')).toContainText('ba', { timeout: 8000 });
    await page.getByRole('button', { name: /⚙ Linguagem/i }).click();
    await expect(page.locator('.words-list')).toContainText('ab');
  });

  test('Descrição Formal parcialmente preenchida sobrevive a reload', async ({ page }) => {
    await goToMTTrans(page);
    await openL1(page);

    await page.locator('.card[data-icon="◯"]').click(); // precisa de 1 nó pra ter linha na tabela δ
    await clickCanvasAt(page, 200, 180);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();
    const formalInputs = page.locator('.test-panel.ap-test-panel input');
    await formalInputs.nth(0).fill('{q0}'); // Q — incompleto de propósito
    await formalInputs.nth(3).fill('q0');   // q0 inicial

    await waitAutosave(page);
    await page.reload();
    await goToMTTrans(page);
    await openL1(page);
    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();

    const restoredInputs = page.locator('.test-panel.ap-test-panel input');
    await expect(restoredInputs.nth(0)).toHaveValue('{q0}');
    await expect(restoredInputs.nth(3)).toHaveValue('q0');
  });

  test('sair para o Menu e reabrir a mesma fase mantém o grafo (sem reload)', async ({ page }) => {
    await goToMTTrans(page);
    await openL1(page);
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 200, 180);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await openL1(page);

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
  });

  test('vencer a fase NÃO limpa mais nada — "Acessar Tabuleiro"/"Limpar Fase" controlam isso (ADR 0012)', async ({ page }) => {
    await goToMTTrans(page);
    await openL2(page);

    // Mesma topologia do gabarito oficial do L2 (src/levels_data/mt/L2.js —
    // formalFill.delta do guidedLesson: q0 complementa, "rewind" recua o
    // cabeçote, estado final aceita) — mas com os rótulos AUTOGERADOS pelo
    // canvas (q0, q1, q2), já que addNode sempre nomeia sequencialmente
    // (useTMGraph.js) e não dá pra criar um nó já nascendo como "q_rw"/"qf"
    // clicando no canvas; renomear rótulo por rótulo não valia o custo extra
    // pra este teste (o ponto é a persistência, não reproduzir o gabarito
    // byte a byte — qualquer MT correta para a mesma linguagem serve).
    const ROWS = ['q0', 'q1', 'q2']; // q1 = "rewind", q2 = estado final
    const COLS = ['0', '1', '□'];
    const TRANSITIONS = [
      { from: 'q0', to: 'q0', read: '0', write: '1', move: 'R' },
      { from: 'q0', to: 'q0', read: '1', write: '0', move: 'R' },
      { from: 'q0', to: 'q1', read: '',  write: '',  move: 'L' },
      { from: 'q1', to: 'q1', read: '0', write: '0', move: 'L' },
      { from: 'q1', to: 'q1', read: '1', write: '1', move: 'L' },
      { from: 'q1', to: 'q2', read: '',  write: '',  move: 'R' },
    ];

    const POSITIONS = [[180, 150], [450, 150], [720, 150]];
    await page.locator('.card[data-icon="◯"]').click();
    for (const [x, y] of POSITIONS) await clickCanvasAt(page, x, y);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(3);
    await page.locator('.card[data-icon="▶"]').click();
    await nodes.nth(0).click(); // q0 inicial
    await page.locator('.card[data-icon="◎"]').click();
    await nodes.nth(2).click(); // qf final

    // Clica perto da base do nó (boundingBox real, não offset fixo) — chips
    // de self-loop tendem a cobrir o centro do nó (achado ao depurar o spec
    // irmão da MT Reconhecedora, ver session_persistence_mt_recon.spec.js).
    const clickNode = async (n) => {
      const box = await nodes.nth(n).boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
    };

    await page.locator('.card[data-icon="↗"]').click();
    for (const t of TRANSITIONS) {
      const fromIdx = ROWS.indexOf(t.from), toIdx = ROWS.indexOf(t.to);
      await clickNode(fromIdx);
      await clickNode(toIdx);
      const editor = page.locator('.tm-transition-editor');
      await editor.waitFor({ timeout: 4000 });
      await page.waitForTimeout(50); // auto-foco do editor (~20ms) — assenta antes de preencher
      const inputs = editor.locator('.tm-te-input');
      if (t.read)  await inputs.nth(0).fill(t.read);
      if (t.write) await inputs.nth(1).fill(t.write);
      await editor.locator('.tm-te-move', { hasText: t.move }).click();
      await editor.locator('.tm-te-ok').click();
    }
    await expect(page.locator('.tm-tl-chip')).toHaveCount(TRANSITIONS.length);

    await page.getByRole('button', { name: /Validar MT/i }).click();

    const formalInputs = page.locator('.test-panel.ap-test-panel input');
    await expect(formalInputs.first()).toBeVisible({ timeout: 4000 });
    await formalInputs.nth(0).fill('{q0, q1, q2}'); // Q
    await formalInputs.nth(1).fill('{0, 1}');       // Sigma
    await formalInputs.nth(2).fill('{0, 1, □}');    // Gamma
    await formalInputs.nth(3).fill('q0');           // q0
    await formalInputs.nth(4).fill('□');            // branco
    await formalInputs.nth(5).fill('q2');           // F — 1 só elemento, sem { }
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
    await openL2(page);
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(3);

    // "🎮 Acessar Tabuleiro" fecha o overlay SEM navegar nem limpar.
    await page.getByRole('button', { name: /🎮 Acessar Tabuleiro/i }).click();
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Limpar Fase/i })).toBeVisible();

    // Essa escolha persiste: reabrir a fase depois vai direto pro tabuleiro.
    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await openL2(page);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(3, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toHaveCount(0);

    // "🗑 Limpar Fase" (confirmação Sim) é a única coisa que de fato limpa.
    await page.getByRole('button', { name: /Limpar Fase/i }).click();
    await page.getByRole('button', { name: /^Sim$/i }).click();
    await expect(page.getByText('Fase limpa!')).toBeVisible();
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0, { timeout: 4000 });
  });

});
