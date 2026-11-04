import { expect, test } from '@playwright/test';

test('M00-05: built UI connects through the real proxy and supports keyboard retry', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '服务已连接' })).toBeVisible();
  const retry = page.getByRole('button', { name: '重新检查' });
  await retry.focus();
  const healthy = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/health') && response.status() === 200,
  );
  await page.keyboard.press('Enter');
  await healthy;
  await expect(page.getByRole('heading', { name: '服务已连接' })).toBeVisible();
  await expect(retry).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('M00-05: visible outage feedback recovers against the real API after retry', async ({
  page,
}) => {
  await page.route('**/api/v1/health', (route) => route.abort('connectionrefused'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '暂时无法连接' })).toBeVisible();
  await page.unroute('**/api/v1/health');
  const healthy = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/health') && response.status() === 200,
  );
  await page.getByRole('button', { name: '重新检查' }).click();
  await healthy;
  await expect(page.getByRole('heading', { name: '服务已连接' })).toBeVisible();
});

test('M00-05: live direct and proxied APIs retain validation and anonymous denial', async ({
  request,
}) => {
  for (const origin of ['http://127.0.0.1:8787', 'http://127.0.0.1:4173']) {
    const health = await request.get(`${origin}/api/v1/health`);
    expect(health.status()).toBe(200);
    expect(await health.json()).toEqual({ status: 'ok', service: 'finpath-api' });
    const invalid = await request.post(`${origin}/api/v1/health/check`, {
      data: { check: 'synthetic-invalid' },
    });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error.code).toBe('INVALID_REQUEST');
    const denied = await request.get(`${origin}/api/v1/private/health`, {
      headers: { Authorization: 'Bearer synthetic-forged', 'X-Workspace-Id': 'synthetic-foreign' },
    });
    expect(denied.status()).toBe(401);
    expect((await denied.json()).error.code).toBe('UNAUTHENTICATED');
  }
});
