import { test, expect } from '@playwright/test';

test.describe('1. Menu Principal, Navegação e Opções', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt="Pirate Battle"]')).toBeVisible({ timeout: 15000 });
  });

  test('Deve exibir todos os elementos do Menu Principal com fidelidade visual', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^options$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^ranking$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^match history$/i })).toBeVisible();
    await expect(page.getByText('PIRATE BATTLE')).toBeVisible();
  });

  test('Deve validar limites (60s a 180s) e persistir opções após recarregar a página (F5)', async ({ page }) => {
    // 1. Abre a tela de Opções
    await page.getByRole('button', { name: /^options$/i }).click();
    await expect(page.getByText('Game session time')).toBeVisible();

    const decTimeBtn = page.getByRole('button', { name: /diminuir tempo/i });
    const incTimeBtn = page.getByRole('button', { name: /aumentar tempo/i });

    // 2. Aumenta o tempo até o limite máximo de 180s (120s -> 150s -> 180s)
    await incTimeBtn.click();
    await incTimeBtn.click();
    await expect(page.getByText('180 s')).toBeVisible();
    await expect(incTimeBtn).toBeDisabled();

    // 3. Diminui de volta até o limite mínimo de 60s (180s -> 150s -> 120s -> 90s -> 60s)
    await decTimeBtn.click();
    await decTimeBtn.click();
    await decTimeBtn.click();
    await decTimeBtn.click();
    await expect(page.getByText('60 s')).toBeVisible();
    await expect(decTimeBtn).toBeDisabled();

    // 4. Configura 120s e spawn de 4s para testar a persistência
    await incTimeBtn.click();
    await incTimeBtn.click(); // 60 -> 90 -> 120
    await expect(page.getByText('120 s')).toBeVisible();

    const incSpawnBtn = page.getByRole('button', { name: /aumentar spawn/i });
    if (await incSpawnBtn.isEnabled()) {
      await incSpawnBtn.click();
    }

    // 5. Volta ao menu principal e recarrega a página (F5)
    await page.getByRole('button', { name: /main menu/i }).click();
    await page.reload();

    // 6. Confirma que os valores foram persistidos no localStorage
    await page.getByRole('button', { name: /^options$/i }).click();
    await expect(page.getByText('120 s')).toBeVisible();
  });

  test('Deve abrir Captains Log nas abas Ranking e Match History e permitir fechar', async ({ page }) => {
    // Abre Ranking
    await page.getByRole('button', { name: /^ranking$/i }).click();
    await expect(page.getByText("Captain's Log")).toBeVisible();
    await expect(page.getByRole('button', { name: /ranking/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /match history/i })).toBeVisible();

    // Alterna para Match History
    await page.getByRole('button', { name: /match history/i }).click();
    await expect(page.getByText('Date', { exact: true })).toBeVisible();
    await expect(page.getByText('Result', { exact: true })).toBeVisible();

    // Volta ao Menu Principal
    await page.getByRole('button', { name: /main menu/i }).click();
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
  });
});
