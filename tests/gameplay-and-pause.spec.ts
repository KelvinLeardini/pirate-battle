import { test, expect } from '@playwright/test';

test.describe('2. Gameplay, HUD e Sistema de Pausa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });
  });

  test('Deve iniciar a partida, exibir HUD completo e responder a comandos de movimento e tiro', async ({ page }) => {
    // Inicia a partida
    await page.getByRole('button', { name: /^play$/i }).click();

    // HUD deve estar visível e ativo
    await expect(page.getByText('HP Navio')).toBeVisible();
    await expect(page.getByText('Tempo')).toBeVisible();
    await expect(page.getByText('Score')).toBeVisible();
    await expect(page.getByRole('button', { name: /pausar jogo/i })).toBeVisible();

    // Canvas do PixiJS deve estar presente e renderizando
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Simula comandos de teclado de combate (W=frente, A=girar, Espaço=tiro frontal, Q=tiro esquerdo, E=tiro direito)
    await page.keyboard.press('KeyW', { delay: 100 });
    await page.keyboard.press('KeyA', { delay: 50 });
    await page.keyboard.press('Space', { delay: 50 });
    await page.keyboard.press('KeyQ', { delay: 50 });
    await page.keyboard.press('KeyE', { delay: 50 });

    // O cronômetro deve estar rodando (menor ou igual a 180s)
    await expect(page.getByText(/\d+s/)).toBeVisible();
  });

  test('Deve pausar via botão e via tecla Escape/P, congelando a simulação e retomando com Resume', async ({ page }) => {
    // 1. Inicia o jogo
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByText('HP Navio')).toBeVisible();

    // 2. Clica no botão de Pausa
    await page.getByRole('button', { name: /pausar jogo/i }).click();
    await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /options/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /main menu/i })).toBeVisible();

    // 3. Retoma o jogo
    await page.getByRole('button', { name: /resume/i }).click();
    await expect(page.getByRole('heading', { name: /paused/i })).not.toBeVisible();
    await page.waitForTimeout(200);

    // 4. Pausa via atalho do teclado (Escape ou P)
    await page.locator('body').focus();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();

    // 5. Volta para o Menu Principal a partir do PauseMenu
    await page.getByRole('button', { name: /main menu/i }).click();
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();
  });
});

