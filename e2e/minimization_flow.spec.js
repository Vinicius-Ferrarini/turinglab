import { test, expect, openActivity, levelButtons } from './helpers/navigation';

test.beforeEach(async ({ page }) => {
  await openActivity(page, /Autômatos Finitos/i, /Minimização/i);
  await levelButtons(page).filter({ hasText: /^L01/ }).click();
});

test('Minimização: permite editar tabela e aponta erro ao verificar tabela vazia', async ({ page }) => {
  await page.locator('.req-check').filter({ hasText: 'Função de transição total?' }).getByRole('button', { name: 'Verificar', exact: true }).click();
  await expect(page.locator('.req-result.err').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Avançar.*Montar Tabela/i })).toBeDisabled();
  const state = page.locator('.req-trans-table tbody th input').first();
  await state.fill('q0');
  await expect(state).toHaveValue('q0');
});

test('Minimização: aula avança, fecha e preserva a tabela sem dar estrelas', async ({ page }) => {
  const state = page.locator('.req-trans-table tbody th input').first();
  await state.fill('q0');
  await page.getByRole('button', { name: /Aula/i }).click();
  await expect(page.locator('.min-lesson-panel')).toBeVisible();
  await expect(page.locator('.min-lesson-count')).toContainText('quadro 1 /');
  await page.locator('.min-lesson-panel').getByRole('button', { name: 'Próximo ▶', exact: true }).click();
  await expect(page.locator('.min-lesson-count')).toContainText('quadro 2 /');
  await page.getByRole('button', { name: /Sair/i }).click();
  await expect(page.locator('.min-lesson-panel')).toHaveCount(0);
  await expect(state).toHaveValue('q0');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress') || '{}')['afd-min-1'])).toBeUndefined();
});
