import { test, expect } from '@playwright/test';

/**
 * E2E тест авторизации администратора через SMS
 * 
 * Сценарий:
 * 1. Открыть страницу входа
 * 2. Ввести номер телефона
 * 3. Получить SMS код
 * 4. Ввести код подтверждения
 * 5. Проверить успешный вход в систему
 * 6. Проверить сохранение сессии (перезагрузка страницы)
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переход на страницу перед очисткой стейта
    await page.goto('/');
    
    // Полная очистка стейта перед каждым тестом
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Лог ирование консольных сообщений для отладки
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    // Перезагрузка страницы после очистки
    await page.reload();
  });

  test('should successfully authenticate admin user via SMS', async ({ page }) => {
    // 1. Проверить, что открыта страница входа
    await expect(page).toHaveURL('/auth/phone');
    await expect(page.getByTestId('auth-phone-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Авторизация');

    // 2. Проверить наличие логотипа
    await expect(page.locator('.auth-phone__logo')).toBeVisible();

    // 3. Ввести номер телефона
    const phoneInput = page.getByTestId('phone-input').locator('input');
    await expect(phoneInput).toBeVisible();
    
    // Вводим тестовый номер телефона: +7 999 888 77 66
    const testPhone = '9998887766'; // 10 цифр без +7
    await phoneInput.fill(testPhone);
    
    // Проверить, что кнопка "Далее" стала активной
    const submitButton = page.getByTestId('submit-phone-button');
    await expect(submitButton).toBeEnabled();

    // 4. Нажать кнопку "Далее"
    await submitButton.click();

    // 5. Проверить переход на страницу ввода кода
    await expect(page).toHaveURL('/auth/code');
    await expect(page.getByTestId('auth-code-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Авторизация');
    
    // Проверить наличие инпутов для кода
    const codeInput = page.getByTestId('code-input');
    await expect(codeInput).toBeVisible();
    const codeInputs = codeInput.locator('input');
    await expect(codeInputs.first()).toBeVisible();

    // 6. Ввести код подтверждения
    // Примечание: В production нужно использовать мок-сервер или тестовый код
    // Для демонстрации используем код '1234', который должен быть настроен в бэкенде для тестов
    const testCode = '1234';
    
    // Вводим каждую цифру кода
    for (let i = 0; i < testCode.length; i++) {
      await codeInputs.nth(i).fill(testCode[i]);
    }

    // 7. Проверить автоматическую отправку кода и переход в систему
    // После ввода последней цифры должен произойти автоматический переход
    // Приложение может редиректить на /dashboard или /orders
    await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/orders', { timeout: 10000 });

    // 8. Проверить, что пользователь успешно вошел в систему
    // Должна быть видна панель управления
    await expect(page.locator('.app-layout, .main-layout, .mobile-layout')).toBeVisible();
    
    // Проверить наличие навигации или других элементов дашборда
    await expect(page.locator('header, nav, [class*="sidebar"]').first()).toBeVisible();

    // 9. Проверить сохранение сессии - перезагрузка страницы
    await page.reload();
    
    // После перезагрузки должны остаться в системе (не редирект на логин)
    await expect(page.locator('.app-layout, .main-layout, .mobile-layout')).toBeVisible();
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth');

    // 10. Проверить, что токен сохранен в localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeTruthy();
  });

  test('should show error for invalid phone number', async ({ page }) => {
    await expect(page).toHaveURL('/auth/phone');

    const phoneInput = page.getByTestId('phone-input').locator('input');
    const submitButton = page.getByTestId('submit-phone-button');

    // Попытка ввести неполный номер
    await phoneInput.fill('999');
    
    // Кнопка должна остаться неактивной
    await expect(submitButton).toBeDisabled();
  });

  test('should show error for invalid SMS code', async ({ page }) => {
    // Сначала проходим этап с телефоном
    await page.goto('/auth/phone');
    
    const phoneInput = page.getByTestId('phone-input').locator('input');
    await phoneInput.fill('9998887766');
    
    const submitButton = page.getByTestId('submit-phone-button');
    await submitButton.click();
    
    // Ждем перехода на страницу кода
    await expect(page).toHaveURL('/auth/code');
    
    // Вводим неправильный код
    const codeInput = page.getByTestId('code-input');
    const codeInputs = codeInput.locator('input');
    const wrongCode = '0000';
    
    for (let i = 0; i < wrongCode.length; i++) {
      await codeInputs.nth(i).fill(wrongCode[i]);
    }
    
    // Проверить, что появилось сообщение об ошибке
    // Примечание: нужно добавить data-testid или класс для сообщения об ошибке
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible({ timeout: 5000 });
    
    // Проверить, что остались на странице ввода кода
    await expect(page).toHaveURL('/auth/code');
  });

  test('should allow code resend after timeout', async ({ page }) => {
    // Проходим этап с телефоном
    await page.goto('/auth/phone');
    
    const phoneInput = page.getByTestId('phone-input').locator('input');
    await phoneInput.fill('9998887766');
    
    const submitButton = page.getByTestId('submit-phone-button');
    await submitButton.click();
    
    await expect(page).toHaveURL('/auth/code');
    
    // Проверить наличие кнопки "Отправить повторно"
    const resendButton = page.getByTestId('resend-code-button');
    await expect(resendButton).toBeVisible();
    
    // Изначально кнопка должна быть неактивна (таймер)
    await expect(resendButton).toBeDisabled();
    
    // Примечание: В реальном тесте можно либо ждать таймер, либо мокать время
    // Для быстрого теста можно использовать page.clock.fastForward()
  });

  test('should redirect to login page when accessing protected route without auth', async ({ page }) => {
    // Попытка открыть защищенную страницу без авторизации
    await page.goto('/orders');
    
    // Должен произойти редирект на страницу логина
    await expect(page).toHaveURL('/auth/phone');
  });

  test('should handle Enter key press on phone input', async ({ page }) => {
    await expect(page).toHaveURL('/auth/phone');

    const phoneInput = page.getByTestId('phone-input').locator('input');
    await phoneInput.fill('9998887766');
    
    // Нажимаем Enter
    await phoneInput.press('Enter');
    
    // Должен произойти переход на страницу ввода кода
    await expect(page).toHaveURL('/auth/code');
  });
});
