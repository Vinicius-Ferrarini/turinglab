// @ts-check
// AFD_1 — bug relatado: desenhar uma FORMA (retângulo/linha/seta) com a
// ferramenta "✏ Riscar", depois trocar pra "⌫ Apagando Rabiscos" e clicar em
// cima da forma lançava "Uncaught TypeError: can't access property 'some',
// e.points is undefined" — a borracha só sabia lidar com traços de lápis
// (que têm `points`); formas guardam x1/y1/x2/y2, sem `points`. Ver
// strokeNearPoint (useDrawing.js), reaproveitada por CanvasArea.jsx.
import { test, expect } from '@playwright/test';

async function goToAFD1(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click().catch(() => {});
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: /Autômatos Finitos/i }).click();
  await page.getByRole('button', { name: /Desenhar & Formalizar/i }).click();
}

// L05 (L = { aⁿ | n > 0 }, alfabeto {a}, menor palavra "a") — 1º nível
// disponível (L01–L04 ocultos).
async function unlockL05(page) {
  await goToAFD1(page);
  await page.locator('canvas, svg').first().waitFor({ timeout: 8000 });
  await page.locator('.menu-btn.primary:not([disabled])').first().click();

  const wordInput = page.locator('.word-input');
  await wordInput.waitFor({ timeout: 8000 });
  await wordInput.fill('a');
  await wordInput.press('Enter');
  await page.getByRole('button', { name: /Validar Desenho do AFD/i }).waitFor({ timeout: 8000 });
}

test('desenhar um retângulo e apagá-lo com a borracha não lança erro (e some do desenho)', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await unlockL05(page);

  // Entra no modo "✏ Riscar" (botão no canto superior direito do canvas).
  await page.locator('button[title="Riscar"]').click();
  await expect(page.locator('.canvas-action-label')).toContainText('Riscar');

  // Escolhe a ferramenta "Retângulo".
  await page.locator('button[title="Retângulo"]').click();

  // Desenha o retângulo via drag real (pointerdown → pointermove → pointerup),
  // igual ao gesto do usuário — precisa de movimento de verdade pro
  // handlePointerMove (onde o bug mora) disparar.
  const box = await page.locator('.canvas-inner').boundingBox();
  const x1 = box.x + 200, y1 = box.y + 200;
  const x2 = box.x + 280, y2 = box.y + 260;
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move((x1 + x2) / 2, (y1 + y2) / 2, { steps: 4 });
  await page.mouse.move(x2, y2, { steps: 4 });
  await page.mouse.up();

  const rect = page.locator('.canvas-inner svg rect');
  await expect(rect).toHaveCount(1);

  // Troca pra "⌫ Apagando Rabiscos" (mesma ferramenta ✏, alterna o modo
  // borracha dentro da toolbar de desenho).
  await page.locator('button[title="Borracha"]').click();
  await expect(page.locator('.canvas-action-label')).toContainText('Apagando Rabiscos');

  // Clica (com um leve arrasto, pra garantir que o pointermove real dispare)
  // em cima do retângulo desenhado.
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
  await page.mouse.move(midX, midY);
  await page.mouse.down();
  await page.mouse.move(midX + 2, midY + 2, { steps: 2 });
  await page.mouse.up();

  // Sem erro não-capturado, e o retângulo realmente some do desenho.
  expect(pageErrors).toEqual([]);
  await expect(rect).toHaveCount(0);
});
