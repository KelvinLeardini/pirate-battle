import { test, expect } from '@playwright/test';

test.describe('3. Simulação de Rede MSW, Erros e Resiliência', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });
  });

  test('Deve alternar para cenário de lista vazia e exibir Empty State temático', async ({ page }) => {
    // 1. Abre o simulador de rede
    await page.getByRole('button', { name: /🌐 msw/i }).click();
    await expect(page.getByText('Network Simulator')).toBeVisible();

    // 2. Seleciona o cenário Empty Lists e fecha o painel
    await page.getByRole('button', { name: /empty lists/i }).click();
    await page.getByRole('button', { name: '✕' }).click();

    // 3. Abre o Captains Log
    await page.getByRole('button', { name: /^ranking$/i }).click();

    // 4. Deve exibir a mensagem de lista vazia
    await expect(page.getByText(/no captains on the board/i)).toBeVisible();

    // Volta ao Menu Principal
    await page.getByRole('button', { name: /main menu/i }).click();
  });

  test('Deve simular erro de servidor (HTTP 500) e exibir mensagem com botão Try Again', async ({ page }) => {
    // 1. Abre o simulador de rede e escolhe Server Error
    await page.getByRole('button', { name: /🌐 msw/i }).click();
    await page.getByRole('button', { name: /server error/i }).click();
    await page.getByRole('button', { name: '✕' }).click();

    // 2. Abre o Captains Log
    await page.getByRole('button', { name: /^ranking$/i }).click();

    // 3. Deve exibir a mensagem de erro da API e o botão de tentar novamente
    await expect(page.getByText(/failed to load ranking/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();

    // 4. Fecha o modal do Capitão
    await page.getByRole('button', { name: /main menu/i }).click();

    // 5. Restaura o simulador para Success
    await page.getByRole('button', { name: /🌐 msw/i }).click();
    await page.getByRole('button', { name: /success/i }).click();
    await page.getByRole('button', { name: '✕' }).click();
  });
});
