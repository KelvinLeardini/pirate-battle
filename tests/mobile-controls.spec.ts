import { test, expect } from '@playwright/test';

test.describe('4. Controles Virtuais de Toque para Mobile', () => {
  test('Deve renderizar e responder aos botões de navegação e combate no mobile', async ({ page, isMobile }) => {
    // Esse teste roda no perfil mobile
    test.skip(!isMobile, 'Teste específico para ambiente mobile touch');

    await page.goto('/');
    await expect(page.getByRole('button', { name: /^play$/i })).toBeVisible({ timeout: 15000 });

    // Inicia a partida
    await page.getByRole('button', { name: /^play$/i }).click();

    // No mobile, os controles de toque DEVEM estar presentes
    const forwardBtn = page.getByRole('button', { name: /avançar/i });
    const turnLeftBtn = page.getByRole('button', { name: /girar esquerda/i });
    const turnRightBtn = page.getByRole('button', { name: /girar direita/i });
    const fireFrontBtn = page.getByRole('button', { name: /canhão frontal/i });
    const fireLeftBtn = page.getByRole('button', { name: /canhões bombordo/i });
    const fireRightBtn = page.getByRole('button', { name: /canhões boreste/i });

    await expect(forwardBtn).toBeVisible();
    await expect(turnLeftBtn).toBeVisible();
    await expect(turnRightBtn).toBeVisible();
    await expect(fireFrontBtn).toBeVisible();
    await expect(fireLeftBtn).toBeVisible();
    await expect(fireRightBtn).toBeVisible();

    // Aciona toques nos controles
    await forwardBtn.dispatchEvent('pointerdown');
    await forwardBtn.dispatchEvent('pointerup');

    await fireFrontBtn.dispatchEvent('pointerdown');
    await fireFrontBtn.dispatchEvent('pointerup');

    await fireLeftBtn.dispatchEvent('pointerdown');
    await fireLeftBtn.dispatchEvent('pointerup');
  });
});

