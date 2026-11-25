import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { expect, test } from '@playwright/test';

let apiProcess;
let databaseDirectory;

test.beforeEach(async () => {
  databaseDirectory = mkdtempSync(join(tmpdir(), 'finpath-m01-05-e2e-'));
  let startupError = '';
  apiProcess = spawn(process.execPath, ['apps/api/dist/dev.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      APP_ENV: 'development',
      NODE_ENV: 'development',
      MOCK_AUTH: 'true',
      PORT: '8788',
      FINPATH_SQLITE_PATH: join(databaseDirectory, 'ledger.sqlite3'),
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  apiProcess.stderr.setEncoding('utf8');
  apiProcess.stderr.on('data', (chunk) => {
    startupError += chunk;
  });

  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (apiProcess.exitCode !== null) break;
    try {
      const response = await fetch('http://127.0.0.1:8788/health');
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      await delay(100);
    }
  }
  if (!ready) throw new Error(`Synthetic ledger API did not start. ${startupError}`);
});

test.afterEach(async () => {
  if (apiProcess && apiProcess.exitCode === null) {
    const exited = new Promise((resolveExit) => apiProcess.once('exit', resolveExit));
    apiProcess.kill('SIGTERM');
    await Promise.race([exited, delay(3000)]);
  }
  apiProcess = undefined;
  if (databaseDirectory) rmSync(databaseDirectory, { recursive: true, force: true });
  databaseDirectory = undefined;
});

async function routeLedgerApi(page) {
  await page.route('**/api/v1/private/**', async (route) => {
    const apiUrl = new URL(route.request().url());
    apiUrl.port = '8788';
    const response = await route.fetch({ url: apiUrl.toString() });
    await route.fulfill({ response });
  });
}

test('M01-05: ledger UI reads and saves through the real SQLite API, with keyboard and currency behavior', async ({
  page,
}) => {
  await routeLedgerApi(page);
  const submissions = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/v1/private/transactions')) {
      submissions.push({ body: request.postDataJSON(), key: request.headers()['idempotency-key'] });
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '账户余额' })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: '日常账户' }).getByRole('strong'),
  ).toHaveText('CAD 0.00');

  await page.getByLabel('金额（CAD）').fill('12.34');
  await page.getByLabel('付款账户').selectOption('demo-checking-cad');
  await page.getByLabel('支出类别').selectOption('demo-food-cad');
  await page.getByLabel('备注').fill('咖啡');
  const expenseResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/private/transactions') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: '保存记录' }).click();
  expect((await expenseResponse).status()).toBe(201);
  await expect(page.getByRole('status').filter({ hasText: '记录已保存' })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: '日常账户' }).getByRole('strong'),
  ).toHaveText('CAD -12.34');
  expect(submissions[0].body).toMatchObject({
    kind: 'expense',
    amount: { amountMinor: '1234', currency: 'CAD' },
    paymentAccountId: 'demo-checking-cad',
    expenseAccountId: 'demo-food-cad',
  });

  const incomeTab = page.getByRole('button', { name: '收入' });
  await incomeTab.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('收入来源')).toBeVisible();
  await page.getByLabel('金额（CAD）').fill('123.45');
  await page.getByLabel('收入账户').selectOption('demo-checking-cad');
  await page.getByLabel('收入来源').selectOption('demo-salary-cad');
  await page.getByLabel('备注').fill('工资');
  const incomeResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/private/transactions') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: '保存记录' }).click();
  expect((await incomeResponse).status()).toBe(201);
  await expect(
    page.getByRole('listitem').filter({ hasText: '日常账户' }).getByRole('strong'),
  ).toHaveText('CAD 111.11');
  expect(submissions[1].body).toMatchObject({
    kind: 'income',
    amount: { amountMinor: '12345', currency: 'CAD' },
  });

  await page.getByRole('button', { name: '账户转账' }).click();
  await page.getByLabel('转出账户').selectOption('demo-checking-cad');
  const transferChoices = await page.getByLabel('转入账户').locator('option').allTextContents();
  expect(transferChoices.join(' ')).toContain('储蓄账户');
  await page.getByLabel('金额（CAD）').fill('20');
  await page.getByLabel('转入账户').selectOption('demo-savings-cad');
  await page.getByLabel('备注').fill('每月储蓄');
  const transferResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/private/transactions') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: '保存记录' }).click();
  expect((await transferResponse).status()).toBe(201);
  await expect(
    page.getByRole('listitem').filter({ hasText: '日常账户' }).getByRole('strong'),
  ).toHaveText('CAD 91.11');
  await expect(
    page.getByRole('listitem').filter({ hasText: '储蓄账户' }).getByRole('strong'),
  ).toHaveText('CAD 20.00');
  expect(submissions[2].body).toMatchObject({
    kind: 'transfer',
    amount: { amountMinor: '2000', currency: 'CAD' },
    fromAccountId: 'demo-checking-cad',
    toAccountId: 'demo-savings-cad',
  });
  expect(new Set(submissions.map(({ key }) => key)).size).toBe(3);
  expect(submissions.every(({ key }) => Boolean(key))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('M01-05: declined save retains form input, shows a friendly error and reuses the idempotency key on retry', async ({
  page,
}) => {
  await routeLedgerApi(page);
  const submissions = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/v1/private/transactions')) {
      submissions.push(request.headers()['idempotency-key']);
    }
  });
  await page.route('**/api/v1/private/transactions', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    return route.fulfill({
      status: 503,
      json: {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'The financial service is unavailable.',
          details: {},
          requestId: '00000000-0000-4000-8000-000000000003',
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('金额（CAD）').fill('45.67');
  await page.getByLabel('备注').fill('保留填写内容');
  await page.getByRole('button', { name: '保存记录' }).click();
  await expect(page.getByRole('alert')).toContainText('账本服务暂不可用');
  await expect(page.getByLabel('金额（CAD）')).toHaveValue('45.67');
  await expect(page.getByLabel('备注')).toHaveValue('保留填写内容');
  await page.getByRole('button', { name: '保存记录' }).click();
  await expect.poll(() => submissions.length).toBe(2);
  expect(submissions[0]).toBe(submissions[1]);
});

test('M01-05: invalid precision is rejected before submission and remains keyboard reachable', async ({
  page,
}) => {
  await routeLedgerApi(page);
  const submissions = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/v1/private/transactions')) {
      submissions.push(request);
    }
  });

  await page.goto('/');
  await page.getByLabel('金额（CAD）').fill('1.001');
  await page.getByLabel('备注').fill('精度边界');
  await page.getByRole('button', { name: '保存记录' }).click();
  await expect(page.getByRole('alert')).toContainText('最多 2 位小数');
  expect(submissions).toHaveLength(0);
  await page.getByLabel('金额（CAD）').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('付款账户')).toBeFocused();
});
