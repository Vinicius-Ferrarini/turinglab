import { test, expect, openActivity, levelButtons, expectExercise } from './helpers/navigation';

const bosses = [
  { name: 'Trabalho', kinds: ['afd-p1', 'afd-p1', 'afd-p2', 'ap-pilha', 'ap-pilha'] },
  { name: 'Prova', kinds: ['afd-p1', 'afd-p1', 'afd-p2', 'afd-min', 'ap-pilha', 'ap-pilha', 'mt-recon', 'mt-trans'] },
];

for (const boss of bosses) {
  for (const [index, kind] of boss.kinds.entries()) {
    const label = `L${String(index + 1).padStart(2, '0')}`;
    test(`${boss.name}: ${label} abre o exercício de ${kind} e retorna à grade correta`, async ({ page }) => {
      await openActivity(page, /Mini-Games/i, new RegExp(boss.name));
      await expect(levelButtons(page)).toHaveCount(boss.kinds.length);
      await levelButtons(page).filter({ hasText: new RegExp(`^${label}`) }).click();
      await expectExercise(page, kind);
      await expect(page.locator('.game-header')).toContainText(label);
      await page.getByRole('button', { name: /Voltar/i }).click();
      await expect(levelButtons(page)).toHaveCount(boss.kinds.length);
    });
  }
}

test('Trabalho: concluir AFD P2 grava estrelas apenas no progresso do desafio', async ({ page }) => {
  await openActivity(page, /Mini-Games/i, /Trabalho/i);
  await levelButtons(page).filter({ hasText: /^L03/ }).click();
  await page.locator('.p2-answer-textarea').fill("L = { bⁿ a (bcd)ᵐ a bᵖ cᵏ e w eʳ aˢ bᵗ cᵘ | n,m,p,r,s,t,u ≥ 0, k > 0, w ∈ {a,b,c,d}*, w tem 'ab' como sufixo }");
  await page.locator('.validate-btn').click();
  await expect(page.locator('.p2-victory-overlay')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('turinglab_progress') || '{}')['boss-trabalho-3']?.stars)).toBe(3);
  const saved = await page.evaluate(() => ({
    normal: JSON.parse(localStorage.getItem('turinglab_progress') || '{}')[58],
    p2: JSON.parse(localStorage.getItem('turinglab_progress_p2') || '{}')[58],
  }));
  expect(saved).toEqual({ normal: undefined, p2: undefined });
});
