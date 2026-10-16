import { test, expect, openActivity, levelButtons, expectExercise } from './helpers/navigation';

const activities = [
  { name: 'AFD P1', module: /Autômatos Finitos/i, activity: /Desenhar & Formalizar/i, count: 20, kind: 'afd-p1' },
  { name: 'AFD P2', module: /Autômatos Finitos/i, activity: /Grafo → Linguagem/i, count: 20, kind: 'afd-p2' },
  { name: 'Minimização', module: /Autômatos Finitos/i, activity: /Minimização/i, count: 15, kind: 'afd-min' },
  { name: 'AP', module: /Autômatos com Pilha/i, count: 20, kind: 'ap-pilha' },
  { name: 'MT Reconhecedora', module: /Máquinas de Turing/i, activity: /Reconhecedora/i, count: 18, kind: 'mt-recon' },
  { name: 'MT Transdutora', module: /Máquinas de Turing/i, activity: /Transdutora/i, count: 21, kind: 'mt-trans' },
  { name: 'Trabalho', module: /Mini-Games/i, activity: /Trabalho/i, count: 5, kind: 'afd-p1' },
  { name: 'Prova', module: /Mini-Games/i, activity: /Prova/i, count: 8, kind: 'afd-p1' },
  { name: 'Menor Palavra', module: /Mini-Games/i, activity: /Menor Palavra/i, count: 20, kind: 'word' },
];

for (const activity of activities) {
  test(`${activity.name}: abre grade, exercício e retorna pelos menus sem falha`, async ({ page }) => {
    await openActivity(page, activity.module, activity.activity);
    await expect(levelButtons(page)).toHaveCount(activity.count);
    await levelButtons(page).first().click();
    await expectExercise(page, activity.kind);
    await page.getByRole('button', { name: /Voltar/i }).click();
    await expect(levelButtons(page)).toHaveCount(activity.count);
    await page.getByRole('button', { name: /Voltar/i }).click();
    await expect(page.locator(activity.activity ? '.submodule-cards' : '.module-cards')).toBeVisible();
  });
}
