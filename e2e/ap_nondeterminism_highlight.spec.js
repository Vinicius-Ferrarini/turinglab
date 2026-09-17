// @ts-check
// AP — quando o aluno tenta criar uma tripla que conflita com uma JÁ
// EXISTENTE (mesmo estado+leitura+topo de pilha), a ação é bloqueada (isso já
// existia) e agora o CHIP da transição já existente que causou o bloqueio
// pisca (.error-pulse-severe) — a seta em si não muda.
import { test, expect } from '@playwright/test';

async function goToAP(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos com Pilha/i }).click();
}

// L1 = { aⁿbⁿ / n ≥ 0 } — 1º nível da grade; menor jogável "ab".
async function openL1(page) {
  await page.locator('.menu-btn.primary').first().click();
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
}

const clickCanvasAt = (page, x, y) =>
  page.locator('.canvas-inner').click({ position: { x, y } });

async function unlockBoard(page) {
  const overlay = page.locator('.locked-overlay');
  await overlay.waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: /Dica/i }).click();
  const cells = overlay.locator('input');
  await expect(cells).toHaveCount(2);
  await cells.nth(0).press('a');
  await cells.nth(1).press('b');
  await expect(page.locator('.locked-overlay')).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('button', { name: /Validar AP/i }).waitFor({ timeout: 8000 });
}

test('tentativa bloqueada destaca a transição existente que já lê/desempilha o mesmo', async ({ page }) => {
  await goToAP(page);
  await openL1(page);
  await unlockBoard(page);

  // 1 estado com auto-loop, 1ª tripla: lê 'a', desempilha 'Z', empilha 'AZ'.
  await page.locator('.card[data-icon="◯"]').click();
  await clickCanvasAt(page, 200, 180);
  const nodes = page.locator('.canvas-inner .node');
  await expect(nodes).toHaveCount(1);

  await page.locator('.card[data-icon="↗"]').click();
  await nodes.nth(0).click();
  await nodes.nth(0).click(); // self-loop
  const editor = page.locator('.ap-tl-editor');
  await editor.waitFor({ timeout: 4000 });
  const firstInputs = editor.locator('.ap-tl-input');
  await firstInputs.nth(0).fill('a');  // read
  await firstInputs.nth(1).fill('Z');  // pop
  await firstInputs.nth(2).fill('AZ'); // push
  await editor.locator('.ap-tl-ok').click();
  await expect(page.locator('.ap-tl-chip')).toHaveCount(1);

  // Tenta adicionar uma 2ª tripla no MESMO estado com o MESMO read+pop
  // (push diferente não importa — o AP exige determinismo em read+pop).
  await page.locator('.ap-tl-add').click();
  const secondEditor = page.locator('.ap-tl-editor');
  await secondEditor.waitFor({ timeout: 4000 });
  const secondInputs = secondEditor.locator('.ap-tl-input');
  await secondInputs.nth(0).fill('a'); // read (mesmo)
  await secondInputs.nth(1).fill('Z'); // pop (mesmo) → conflito
  await secondInputs.nth(2).fill('Z');
  await secondEditor.locator('.ap-tl-ok').click();

  // Bloqueado: continua só 1 chip, toast de erro aparece.
  await expect(page.locator('.toast-notification.error')).toContainText(/Ação bloqueada.*lê "a".*desempilha "Z"/i);

  // O chip da transição JÁ EXISTENTE (a 1ª, que causou o bloqueio) pisca.
  const chips = page.locator('.ap-tl-chip');
  await expect(chips).toHaveCount(1);
  await expect(chips.nth(0)).toHaveClass(/error-pulse-severe/);
});
