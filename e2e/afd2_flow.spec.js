import { test, expect, openActivity, levelButtons } from './helpers/navigation';

test.beforeEach(async ({ page }) => {
  await openActivity(page, /Autômatos Finitos/i, /Grafo → Linguagem/i);
});

test('AFD P2: mantém L14 bloqueada e carrega todas as páginas da grade', async ({ page }) => {
  await expect(levelButtons(page).filter({ hasText: /^L14/ })).toBeDisabled();
  const labels = [];
  for (const count of [20, 20, 18]) {
    await expect(levelButtons(page)).toHaveCount(count);
    labels.push(...await levelButtons(page).allTextContents());
    if (count === 20) await page.getByRole('button', { name: 'Próxima ➡', exact: true }).click();
  }
  expect(new Set(labels).size).toBe(58);
  await expect(page.getByRole('button', { name: 'Próxima ➡', exact: true })).toBeDisabled();
});

test('AFD P2: resposta incorreta não conclui; acerto seguinte vale duas estrelas e persiste', async ({ page }) => {
  await levelButtons(page).filter({ hasText: /^L05/ }).click();
  const answer = page.locator('.p2-answer-textarea');
  await answer.fill('{ b^n | n > 0 }');
  await page.locator('.validate-btn').click();
  await expect(answer).toHaveClass(/p2-err/);
  await expect(page.locator('.p2-victory-overlay')).toHaveCount(0);
  await answer.fill('{ a^n | n > 0 }');
  await page.locator('.validate-btn').click();
  await expect(page.locator('.p2-victory-overlay')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress_p2'))?.[5]?.stars)).toBe(2);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress_p2'))?.[5]?.stars)).toBe(2);
});

test('AFD P2: testa uma palavra e abre o simulador do grafo', async ({ page }) => {
  await levelButtons(page).filter({ hasText: /^L05/ }).click();
  await page.getByPlaceholder('Ex: aab  (vazia = λ)').fill('a');
  await page.locator('.add-test-btn').click();
  await expect(page.locator('.words-list .word-row')).toHaveCount(1);
  // Adicionar à lista limpa o campo; o botão Simular usa a entrada atual.
  await page.getByPlaceholder('Ex: aab  (vazia = λ)').fill('a');
  await page.getByRole('button', { name: /Simular/i }).click();
  await expect(page.locator('.sim-panel-container')).toBeVisible();
  await page.locator('.sim-panel-container').getByRole('button', { name: '▶', exact: true }).click();
  await expect(page.locator('.sim-current-step')).toContainText('—[a]→');
  await page.locator('.sim-panel-close').click();
  await expect(page.locator('.sim-panel-container')).toHaveCount(0);
});
