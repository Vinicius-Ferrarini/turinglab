import { test as base, expect } from '@playwright/test';

// Cada teste falha se a navegação esconder um erro de execução ou um asset local indisponível.
export const test = base.extend({
  page: async ({ page, baseURL }, runTest) => {
    const errors = [];
    const isLocalAsset = request => new URL(request.url()).origin === new URL(baseURL).origin
      && ['script', 'stylesheet'].includes(request.resourceType());
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /Maximum update depth|Uncaught|React error/i.test(message.text())) {
        errors.push(message.text());
      }
    });
    page.on('requestfailed', request => {
      if (isLocalAsset(request) && request.failure()?.errorText !== 'net::ERR_ABORTED') {
        errors.push(`${request.url()}: ${request.failure()?.errorText}`);
      }
    });
    page.on('response', response => {
      if (isLocalAsset(response.request()) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await runTest(page);
    expect(errors, 'Erros de execução ou de carregamento de arquivos do jogo').toEqual([]);
  },
});
export { expect };

export async function openActivity(page, module, activity) {
  await page.goto('/');
  await page.getByRole('button', { name: /Fechar sem aceitar/i }).click();
  await page.getByRole('button', { name: /Começar Aventura/i }).click();
  await page.getByRole('button', { name: module }).click();
  if (activity) await page.getByRole('button', { name: activity }).click();
  await expect(page.locator('.levels-grid')).toBeVisible();
}

export const levelButtons = page => page.locator('.levels-grid > button');

export async function expectExercise(page, kind) {
  if (kind === 'word') {
    await expect(page.locator('input[maxlength="1"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Dica/i })).toBeVisible();
    return;
  }
  await expect(page.locator('.game-header')).toBeVisible();
  if (kind === 'afd-p2') {
    await expect(page.locator('.p2-svg-box svg').first()).toBeVisible();
    await expect(page.locator('.p2-answer-textarea')).toBeVisible();
  } else if (kind === 'afd-min') {
    await expect(page.locator('.req-trans-table')).toBeVisible();
    await expect(page.getByRole('button', { name: /Avançar.*Montar Tabela/i })).toBeDisabled();
  } else {
    await expect(page.locator('.canvas-area')).toBeVisible();
  }
}
