import { test, expect } from '@playwright/test';

test('MT Transdutora informa falha de importação e volta a carregar após recarregar', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const failedModule = '**/src/levels_data/mt/_decimalMult.js*';
  await page.route(failedModule, route => route.abort());

  const openTransducer = async () => {
    await page.getByRole('button', { name: /Começar Aventura/i }).click();
    await page.getByRole('button', { name: /Máquinas de Turing/i }).click();
    await page.getByRole('button', { name: /Transdutora/i }).click();
  };

  await page.goto('/');
  await openTransducer();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os níveis.');
  await expect(page.getByText('Carregando níveis…', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);

  await page.unroute(failedModule);
  await page.getByRole('button', { name: 'Recarregar página' }).click();
  await openTransducer();
  await expect(page.locator('.menu-btn.primary').filter({ hasText: /^L\d+/ })).toHaveCount(21);
  expect(errors).toEqual([]);
});
