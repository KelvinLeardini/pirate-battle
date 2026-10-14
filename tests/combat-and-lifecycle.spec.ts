import { test, expect } from '@playwright/test';

test.describe('6. Ciclo de Vida, Abandono de Partida e Paginação do Ranking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });
  });

  test('Deve pausar automaticamente ao perder o foco (blur)', async ({ page }) => {
    // 1. Inicia o jogo
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByText('HP Navio')).toBeVisible();

    // 2. Dispara evento de blur (simula clique fora da janela ou Alt+Tab)
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));

    // 3. O PauseMenu deve aparecer automaticamente
    await expect(page.getByRole('heading', { name: /paused/i })).toBeVisible();

    // 4. Retoma a partida
    await page.getByRole('button', { name: /resume/i }).click();
    await expect(page.getByRole('heading', { name: /paused/i })).not.toBeVisible();
  });

  test('Abandono de partida: sair para o Menu Principal não deve registrar histórico', async ({ page }) => {
    // 1. Inicia o combate
    await page.getByRole('button', { name: /^play$/i }).click();
    await expect(page.getByText('HP Navio')).toBeVisible();

    // 2. Pausa e clica em Main Menu para abandonar
    await page.getByRole('button', { name: /pausar jogo/i }).click();
    await page.getByRole('button', { name: /main menu/i }).click();
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible();

    // 3. Abre o Histórico de Batalhas
    await page.getByRole('button', { name: /^match history$/i }).click();
    await expect(page.getByText("Captain's Log")).toBeVisible();

    // 4. Não deve haver partidas registradas
    await expect(page.getByText(/no battle history recorded/i)).toBeVisible();

    await page.getByRole('button', { name: /main menu/i }).click();
  });

  test('Paginação do Ranking: deve paginar entre capitães lendários (Fixtures)', async ({ page }) => {
    // 1. Abre o Ranking
    await page.getByRole('button', { name: /^ranking$/i }).click();
    await expect(page.getByText("Captain's Log")).toBeVisible();

    // 2. Na página 1 (5 itens por página), deve ver os top capitães
    await expect(page.getByText('Blackbeard')).toBeVisible();
    await expect(page.getByText('Anne Bonny')).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();

    // 3. Clica na próxima página
    const nextPageBtn = page.getByRole('button', { name: /próxima página/i });
    await expect(nextPageBtn).toBeEnabled();
    await nextPageBtn.click();

    // 4. Na página 2, deve ver os capitães subsequentes
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page.getByText('Mary Read')).toBeVisible();
    await expect(page.getByText('Captain Hook')).toBeVisible();

    // 5. Botão de próxima página fica desabilitado
    await expect(nextPageBtn).toBeDisabled();

    // 6. Retorna para a página 1
    const prevPageBtn = page.getByRole('button', { name: /página anterior/i });
    await prevPageBtn.click();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByText('Blackbeard')).toBeVisible();

    await page.getByRole('button', { name: /main menu/i }).click();
  });
});
