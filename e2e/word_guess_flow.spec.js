import { test, expect, openActivity, levelButtons } from './helpers/navigation';

test.beforeEach(async ({ page }) => {
  await openActivity(page, /Mini-Games/i, /Menor Palavra/i);
});

test('Menor Palavra: percorre todas as páginas e abre exercícios de AFD, AP e MT', async ({ page }) => {
  const labels = [];
  for (const [index, count] of [20, 20, 20, 20, 4].entries()) {
    await expect(levelButtons(page)).toHaveCount(count);
    labels.push(...await levelButtons(page).allTextContents());
    if (index < 4) await page.getByRole('button', { name: 'Próxima ➡', exact: true }).click();
  }
  expect(new Set(labels).size).toBe(84);
  await expect(page.getByRole('button', { name: 'Próxima ➡', exact: true })).toBeDisabled();
  await levelButtons(page).filter({ hasText: /^MT/ }).first().click();
  await expect(page.locator('input[maxlength="1"]').first()).toBeVisible();
  await page.getByRole('button', { name: /Voltar/i }).click();
  // A grade remonta na primeira página; a quarta página contém AP.
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Próxima ➡', exact: true }).click();
  await levelButtons(page).filter({ hasText: /^AP/ }).first().click();
  await expect(page.locator('input[maxlength="1"]').first()).toBeVisible();
});

test('Menor Palavra: acerto concede uma estrela, persiste e permite abrir o próximo exercício', async ({ page }) => {
  await levelButtons(page).filter({ hasText: /AFD · L05/ }).click();
  await page.locator('input[maxlength="1"]').first().press('a');
  await expect(page.getByText('⭐ Menor palavra encontrada: "a"', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress') || '{}')['word-guess-afd-5']?.stars)).toBe(1);
  await page.getByRole('button', { name: 'Próxima fase ▶', exact: true }).click();
  await expect(page.locator('input[maxlength="1"]').first()).toBeVisible();
  await expect(page.getByText('⭐ Menor palavra encontrada: "a"', { exact: true })).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress') || '{}')['word-guess-afd-5']?.stars)).toBe(1);
});
