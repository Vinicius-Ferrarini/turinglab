// @ts-check
// Persistência de sessão por fase (Autômatos com Pilha) — ver ADR 0011. Mesma
// cobertura do AFD_1 (session_persistence_afd1.spec.js), adaptada à UI do AP
// (triplas read/pop/push via editor inline, sem estado final).
import { test, expect } from '@playwright/test';

async function goToAP(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos com Pilha/i }).click();
}

// L1 = { aⁿbⁿ / n ≥ 0 } — 1º nível da grade; menor jogável "ab" (λ é a menor
// de verdade, mas não cabe na grade — ver findSecondShortestWord.js).
async function openL1(page) {
  await page.locator('.menu-btn.primary').first().click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function unlockBoard(page) {
  const overlay = page.locator('.locked-overlay');
  await overlay.waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: /Dica/i }).click(); // revela a grade (tamanho)
  const cells = overlay.locator('input');
  await expect(cells).toHaveCount(2);
  await cells.nth(0).press('a');
  await cells.nth(1).press('b');
  await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('button', { name: /Validar AP/i }).waitFor({ timeout: 8000 });
}

async function waitAutosave(page) {
  await page.waitForTimeout(700);
}

test.describe('AP — persistência de sessão por fase', () => {

  test('grafo parcial (sem estado inicial definido) sobrevive a page.reload()', async ({ page }) => {
    await goToAP(page);
    await openL1(page);
    await unlockBoard(page);

    // 1 estado, SEM definir inicial, com 1 tripla — propositalmente
    // incompleto (nunca validar antes de salvar, ver ADR 0011).
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 200, 180);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(1);

    await page.locator('.card[data-icon="↗"]').click();
    await nodes.nth(0).click();
    await nodes.nth(0).click(); // self-loop
    const editor = page.locator('.ap-tl-editor');
    await editor.waitFor({ timeout: 4000 });
    await editor.locator('.ap-tl-input').nth(0).fill('a'); // read
    await editor.locator('.ap-tl-ok').click();
    await expect(page.locator('.ap-tl-chip')).toBeVisible();

    await waitAutosave(page);
    await page.reload();
    await goToAP(page);
    await page.locator('.menu-btn.primary').first().click();

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('.ap-tl-chip')).toBeVisible();
    await expect(page.locator('.canvas-inner .node.initial')).toHaveCount(0);
  });

  test('histórico de palavras testadas (aba Linguagem) sobrevive a reload', async ({ page }) => {
    await goToAP(page);
    await openL1(page);

    const wordInput = page.locator('.word-input');
    await wordInput.fill('ab'); await page.locator('.add-test-btn').first().click(); // menor → destrava
    await page.getByRole('button', { name: /Validar AP/i }).waitFor({ timeout: 8000 });
    await wordInput.fill('aabb'); await page.locator('.add-test-btn').first().click();
    await wordInput.fill('ba'); await page.locator('.add-test-btn').first().click();
    await expect(page.locator('.word-row')).toHaveCount(3);

    await waitAutosave(page);
    await page.reload();
    await goToAP(page);
    await page.locator('.menu-btn.primary').first().click();

    await expect(page.locator('.word-row')).toHaveCount(3, { timeout: 8000 });
  });

  test('"descubra a menor palavra" continua destravado após reload', async ({ page }) => {
    await goToAP(page);
    await openL1(page);
    await unlockBoard(page);

    await waitAutosave(page);
    await page.reload();
    await goToAP(page);
    await page.locator('.menu-btn.primary').first().click();

    await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 8000 });
    await expect(page.getByRole('button', { name: /Validar AP/i })).toBeVisible();
  });

  test('Descrição Formal parcialmente preenchida sobrevive a reload', async ({ page }) => {
    await goToAP(page);
    await openL1(page);
    await unlockBoard(page);

    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();
    const formalInputs = page.locator('.formal-sidebar-content .form-group input');
    await formalInputs.nth(0).fill('q0'); // E — incompleto de propósito
    await formalInputs.nth(3).fill('q0'); // i — estado inicial

    await waitAutosave(page);
    await page.reload();
    await goToAP(page);
    await page.locator('.menu-btn.primary').first().click();
    await page.locator('button.sidebar-toggle, [title="Abrir Descrição Formal"]').first().click();

    const restoredInputs = page.locator('.formal-sidebar-content .form-group input');
    await expect(restoredInputs.nth(0)).toHaveValue('q0');
    await expect(restoredInputs.nth(3)).toHaveValue('q0');
  });

  test('sair para o Menu e reabrir a mesma fase mantém o grafo (sem reload)', async ({ page }) => {
    await goToAP(page);
    await openL1(page);
    await unlockBoard(page);
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 200, 180);
    await expect(page.locator('.canvas-inner .node')).toHaveCount(1);

    await waitAutosave(page);
    await page.getByRole('button', { name: /⬅ Voltar/i }).click();
    await page.locator('.menu-btn.primary').first().click();

    await expect(page.locator('.canvas-inner .node')).toHaveCount(1, { timeout: 8000 });
  });

  test('vencer a fase e clicar "Voltar ao Menu" limpa a sessão (reabre em branco)', async ({ page }) => {
    await goToAP(page);
    await openL1(page);
    await unlockBoard(page);

    // AP correto p/ { aⁿbⁿ | n≥0 }, 2 estados — precisa de 2 (não 1: um único
    // estado com só self-loops aceitaria QUALQUER sequência balanceada tipo
    // pilha, ex. "abab", não só a's-antes-de-b's — achado ao depurar este
    // spec, primeira versão com 1 estado só passava no "Validar AP" só por
    // sorte de bateria, mas falhava aqui):
    //   q0(inicial) -- a, λ ; A --> q0   (empilha A por cada 'a')
    //   q0 -- b, A ; λ --> q1            (1º 'b' migra pra q1)
    //   q1 -- b, A ; λ --> q1            (desempilha os demais 'b's)
    //   q0 -- λ, Z ; λ --> q1            (n=0: aceita direto)
    //   q1 -- λ, Z ; λ --> q1            (n≥1: esvazia a pilha no fim)
    await page.locator('.card[data-icon="◯"]').click();
    await clickCanvasAt(page, 180, 180);
    await clickCanvasAt(page, 420, 180);
    const nodes = page.locator('.canvas-inner .node');
    await expect(nodes).toHaveCount(2);
    await page.locator('.card[data-icon="▶"]').click();
    await nodes.nth(0).click();

    const addTriple = async (fromIdx, toIdx, read, pop, push) => {
      await nodes.nth(fromIdx).click();
      await nodes.nth(toIdx).click();
      const editor = page.locator('.ap-tl-editor');
      await editor.waitFor({ timeout: 4000 });
      // O editor auto-foca o campo "read" ~20ms após montar (ver
      // TripleEditor em APTransitionLabel.jsx) — preencher antes disso é uma
      // corrida real (achado ao depurar este spec: o valor digitado em
      // "pop"/"push" podia acabar sobrescrito pelo auto-foco voltando pro
      // campo "read"). Espera assentar antes de preencher.
      await page.waitForTimeout(50);
      const inputs = editor.locator('.ap-tl-input');
      if (read)  await inputs.nth(0).fill(read);
      if (pop)   await inputs.nth(1).fill(pop);
      if (push)  await inputs.nth(2).fill(push);
      await editor.locator('.ap-tl-ok').click();
    };
    // O modo CONNECTING continua ativo depois de cada tripla confirmada (só
    // clica o card "↗" 1×) — reclicar de novo alternaria o modo pra IDLE,
    // mesma armadilha do AFD (ver session_persistence_afd1.spec.js).
    await page.locator('.card[data-icon="↗"]').click();
    await addTriple(0, 0, 'a', '', 'A');
    await addTriple(0, 1, 'b', 'A', '');
    await addTriple(1, 1, 'b', 'A', '');
    await addTriple(0, 1, '', 'Z', ''); // 2ª tripla na MESMA aresta q0→q1
    await addTriple(1, 1, '', 'Z', ''); // 2ª tripla no MESMO self-loop de q1
    await expect(page.locator('.ap-tl-chip')).toHaveCount(5);

    await page.getByRole('button', { name: /Validar AP/i }).click();

    const formalInputs = page.locator('.formal-sidebar-content .form-group input');
    await expect(formalInputs.first()).toBeVisible({ timeout: 4000 });
    await formalInputs.nth(0).fill('{q0, q1}');  // E
    await formalInputs.nth(1).fill('{a, b}');    // Sigma
    await formalInputs.nth(2).fill('{A, Z}');    // Gamma
    await formalInputs.nth(3).fill('q0');        // initial
    await formalInputs.nth(4).fill('Z');         // bottom
    await page.getByRole('button', { name: /Validar Elementos/i }).click();

    // Linhas na ordem de criação das triplas acima — ver comentário do grafo.
    const deltaInputs = page.locator('.ap-delta-table input');
    await expect(deltaInputs).toHaveCount(10, { timeout: 4000 }); // 5 linhas × (destino, empilha)
    await deltaInputs.nth(0).fill('q0'); await deltaInputs.nth(1).fill('A'); // a,λ;A → q0, A
    await deltaInputs.nth(2).fill('q1');                                     // b,A;λ → q1, λ
    await deltaInputs.nth(4).fill('q1');                                     // b,A;λ → q1, λ
    await deltaInputs.nth(6).fill('q1');                                     // λ,Z;λ → q1, λ
    await deltaInputs.nth(8).fill('q1');                                     // λ,Z;λ → q1, λ
    await page.getByRole('button', { name: /Validar Transições/i }).click();

    await expect(page.getByRole('button', { name: /Voltar ao Menu/i })).toBeVisible({ timeout: 4000 });
    await page.getByRole('button', { name: /Voltar ao Menu/i }).click();

    await page.locator('.menu-btn.primary').first().click();
    await expect(page.locator('.locked-overlay')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.canvas-inner .node')).toHaveCount(0);
  });

});
