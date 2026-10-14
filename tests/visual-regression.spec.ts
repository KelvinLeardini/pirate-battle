import { test, expect } from '@playwright/test';

test.describe('5. Regressão Visual com Baselines Versionadas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });
  });

  test('Regressão visual: Menu Principal estável', async ({ page }) => {
    // Aguarda carregar todos os elementos visuais principais
    await expect(page.locator('img[alt="Pirate Battle"]')).toBeVisible();
    await page.waitForTimeout(500); // Estabilização das ondas de fundo

    await expect(page).toHaveScreenshot('main-menu-stable.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
    });
  });

  test('Regressão visual: Tela de Opções', async ({ page }) => {
    await page.getByRole('button', { name: /^options$/i }).click();
    await expect(page.getByText('Game session time')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('options-menu-stable.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
    });
  });

  test('Regressão visual: Captains Log (Ranking com Fixtures)', async ({ page }) => {
    await page.getByRole('button', { name: /^ranking$/i }).click();
    await expect(page.getByText("Captain's Log")).toBeVisible();
    await expect(page.getByText('Blackbeard')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('captains-log-ranking-stable.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
    });
  });
});
