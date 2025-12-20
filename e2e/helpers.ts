import type { Page } from '@playwright/test';

/**
 * Тестовые данные для E2E тестов
 */

export const TEST_USERS = {
  admin: {
    phone: '9998887766',
    formattedPhone: '+79998887766',
    code: '1234',
  },
};

export const TEST_ROUTES = {
  authPhone: '/auth/phone',
  authCode: '/auth/code',
  dashboard: '/dashboard',
  orders: '/orders',
  services: '/services',
  schedule: '/schedule',
  analytics: '/analytics',
};

/**
 * Утилиты для работы с тестами
 */

/**
 * Очистить все данные авторизации
 */
export async function clearAuthData(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Авторизоваться в системе (для тестов, где авторизация не является основным сценарием)
 */
export async function authenticateUser(page: Page, phone: string = TEST_USERS.admin.phone, code: string = TEST_USERS.admin.code): Promise<void> {
  await page.goto(TEST_ROUTES.authPhone);
  
  // Ввод телефона
  const phoneInput = page.getByTestId('phone-input').locator('input');
  await phoneInput.fill(phone);
  
  const submitButton = page.getByTestId('submit-phone-button');
  await submitButton.click();
  
  // Ввод кода
  await page.waitForURL(TEST_ROUTES.authCode);
  const codeInput = page.getByTestId('code-input');
  const codeInputs = codeInput.locator('input');
  
  for (let i = 0; i < code.length; i++) {
    await codeInputs.nth(i).fill(code[i]);
  }
  
  // Ожидание перехода на дашборд или orders
  await page.waitForURL(url => 
    url.pathname === TEST_ROUTES.dashboard || 
    url.pathname === TEST_ROUTES.orders, 
    { timeout: 10000 }
  );
}

/**
 * Проверить, что пользователь авторизован
 */
export async function expectAuthenticated(page: Page): Promise<boolean> {
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  return !!accessToken;
}

/**
 * Ожидание появления toast-уведомления
 */
export async function waitForToast(page: Page, text?: string) {
  const toast = page.locator('[role="alert"], .toast, .notification');
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  
  if (text) {
    await page.locator(`text=${text}`).first().waitFor({ state: 'visible' });
  }
  
  return toast;
}
