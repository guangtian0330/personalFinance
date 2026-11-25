import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { AccountResponse, CreateTransactionRequest } from '@finpath/contracts';
import { ApiError, createApiClient } from './api-client.js';
import { checkApiHealth } from './api-health.js';
import {
  amountToMinorUnits,
  balancesFromTransactions,
  formatMinorUnits,
  getCompleteTransactionHistory,
  localDateTimeValue,
} from './ledger-view.js';

type LedgerState = 'loading' | 'ready' | 'unavailable';
type EntryKind = 'income' | 'expense' | 'transfer';
type ServiceState = 'checking' | 'connected' | 'unavailable';

const client = createApiClient();

function friendlyError(error: unknown): string {
  if (!(error instanceof ApiError)) return '暂时无法保存。请检查网络连接后重试。';
  switch (error.error.code) {
    case 'UNAUTHENTICATED':
      return '登录状态已失效，请重新登录后继续。';
    case 'NOT_FOUND':
      return '所选账户已不可用。请刷新账户列表后重试。';
    case 'CONFLICT':
      return '这笔记录与已有提交冲突。请确认记录后再试。';
    case 'UNPROCESSABLE_ENTITY':
      return '这笔收支无法保存，请检查金额、币种和账户。';
    case 'SERVICE_UNAVAILABLE':
      return '账本服务暂不可用，请稍后重试。你填写的内容仍保留在表单中。';
    default:
      return '暂时无法保存。请检查网络连接后重试。';
  }
}

function currencyScale(currency: AccountResponse['currency']): number {
  return currency === 'JPY' ? 0 : 2;
}

export function App() {
  const [serviceState, setServiceState] = useState<ServiceState>('checking');
  const [ledgerState, setLedgerState] = useState<LedgerState>('loading');
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [balances, setBalances] = useState<Map<string, bigint>>(new Map());
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [kind, setKind] = useState<EntryKind>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState(localDateTimeValue);
  const [primaryAccountId, setPrimaryAccountId] = useState('');
  const [secondaryAccountId, setSecondaryAccountId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);
  const idempotency = useRef<{ request: string; key: string } | null>(null);

  // refreshKey explicitly reloads after the user requests it or a write succeeds.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is the intentional reload trigger.
  useEffect(() => {
    const controller = new AbortController();
    let healthChecked = false;
    setServiceState('checking');
    setLedgerState('loading');
    setLoadError('');
    void (async () => {
      try {
        await checkApiHealth(controller.signal);
        if (controller.signal.aborted) return;
        healthChecked = true;
        setServiceState('connected');
        const nextAccounts = await client.getAccounts(controller.signal);
        const history = await getCompleteTransactionHistory((cursor) =>
          client.getTransactions(cursor, controller.signal),
        );
        if (controller.signal.aborted) return;
        setAccounts(nextAccounts);
        setBalances(balancesFromTransactions(nextAccounts, history));
        setLedgerState('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        if (!healthChecked) setServiceState('unavailable');
        setLoadError(friendlyError(error));
        setLedgerState('unavailable');
      }
    })();
    return () => controller.abort();
  }, [refreshKey]);

  const primaryAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        if (kind === 'income') return account.kind === 'asset';
        if (kind === 'expense') return account.kind === 'asset' || account.kind === 'liability';
        return account.kind === 'asset';
      }),
    [accounts, kind],
  );
  const primaryAccount = primaryAccounts.find((account) => account.id === primaryAccountId);
  const secondaryAccounts = useMemo(() => {
    if (kind === 'income')
      return accounts.filter(
        (account) => account.kind === 'income' && account.currency === primaryAccount?.currency,
      );
    if (kind === 'expense')
      return accounts.filter(
        (account) => account.kind === 'expense' && account.currency === primaryAccount?.currency,
      );
    return accounts.filter(
      (account) =>
        account.kind === 'asset' &&
        account.currency === primaryAccount?.currency &&
        account.id !== primaryAccountId,
    );
  }, [accounts, kind, primaryAccount?.currency, primaryAccountId]);

  useEffect(() => {
    if (!primaryAccounts.some((account) => account.id === primaryAccountId)) {
      setPrimaryAccountId(primaryAccounts[0]?.id ?? '');
    }
  }, [primaryAccounts, primaryAccountId]);
  useEffect(() => {
    if (!secondaryAccounts.some((account) => account.id === secondaryAccountId)) {
      setSecondaryAccountId(secondaryAccounts[0]?.id ?? '');
    }
  }, [secondaryAccounts, secondaryAccountId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || !primaryAccount) return;
    submitLock.current = true;
    setSaving(true);
    setSubmitError('');
    setNotice('');
    let request: CreateTransactionRequest;
    try {
      const money = {
        amountMinor: amountToMinorUnits(amount, primaryAccount.currency),
        currency: primaryAccount.currency,
      };
      const common = {
        occurredAt: new Date(occurredAt).toISOString(),
        description: description.trim(),
        amount: money,
      };
      if (kind === 'income') {
        request = {
          kind,
          ...common,
          cashAccountId: primaryAccount.id,
          incomeAccountId: secondaryAccountId,
        };
      } else if (kind === 'expense') {
        request = {
          kind,
          ...common,
          paymentAccountId: primaryAccount.id,
          expenseAccountId: secondaryAccountId,
        };
      } else {
        request = {
          kind,
          ...common,
          fromAccountId: primaryAccount.id,
          toAccountId: secondaryAccountId,
        };
      }
      const serialized = JSON.stringify(request);
      if (!idempotency.current || idempotency.current.request !== serialized) {
        idempotency.current = { request: serialized, key: crypto.randomUUID() };
      }
      await client.createTransaction(request, idempotency.current.key);
      idempotency.current = null;
      setAmount('');
      setDescription('');
      setOccurredAt(localDateTimeValue());
      setNotice('记录已保存，账户余额已更新。');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message === 'INVALID_AMOUNT'
          ? `请输入有效金额，最多 ${currencyScale(primaryAccount.currency)} 位小数。`
          : friendlyError(error),
      );
    } finally {
      submitLock.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="app-shell ledger-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="FinPath 首页">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M7 25V16h8V7h10M15 7v18M7 16h18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          FinPath
        </a>
        <span className="environment">账户与收支</span>
      </header>

      <section className={`service-status ${serviceState}`} aria-label="连接状态">
        <div className="connection-message" role="status" aria-live="polite" aria-atomic="true">
          <h2>
            {serviceState === 'checking'
              ? '正在检查连接'
              : serviceState === 'connected'
                ? '服务已连接'
                : '暂时无法连接'}
          </h2>
          <p>
            {serviceState === 'checking'
              ? '正在确认本地服务是否可用。'
              : serviceState === 'connected'
                ? '服务可用；账本数据还需要独立加载。'
                : '请确认本地服务已启动，然后重新检查。'}
          </p>
        </div>
        <button
          type="button"
          disabled={serviceState === 'checking'}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          {serviceState === 'checking' ? '检查中…' : '重新检查'}
          <span aria-hidden="true">↗</span>
        </button>
      </section>

      <main className="ledger-main">
        <section className="ledger-intro" aria-labelledby="ledger-title">
          <p className="eyebrow">日常账本</p>
          <h1 id="ledger-title">
            让每一笔收支，
            <br />
            清楚可见。
          </h1>
          <p className="introduction">
            选择账户，记录收入、支出或账户间转账。余额按账户原币种显示。
          </p>
        </section>

        <section className="account-panel" aria-labelledby="accounts-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">你的账户</p>
              <h2 id="accounts-title">账户余额</h2>
            </div>
            <button
              className="quiet-button"
              type="button"
              disabled={ledgerState === 'loading'}
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              {ledgerState === 'loading' ? '更新中…' : '刷新'}
            </button>
          </div>
          {ledgerState === 'loading' && <p role="status">正在载入账户与余额…</p>}
          {ledgerState === 'unavailable' && (
            <div className="inline-error" role="alert">
              <p>{loadError}</p>
              <button
                className="quiet-button"
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
              >
                重新加载
              </button>
            </div>
          )}
          {ledgerState === 'ready' &&
            (accounts.length === 0 ? (
              <p className="empty-state">当前没有可用账户。</p>
            ) : (
              <ul className="account-list">
                {accounts.map((account) => (
                  <li key={account.id}>
                    <span>
                      <span className="account-name">{account.name}</span>
                      <span className="account-kind">
                        {account.kind === 'asset'
                          ? '资产'
                          : account.kind === 'liability'
                            ? '负债'
                            : account.kind === 'income'
                              ? '收入'
                              : account.kind === 'expense'
                                ? '支出'
                                : '权益'}{' '}
                        · {account.currency}
                      </span>
                    </span>
                    <strong>
                      {formatMinorUnits(balances.get(account.id) ?? 0n, account.currency)}
                    </strong>
                  </li>
                ))}
              </ul>
            ))}
        </section>

        <section className="entry-panel" aria-labelledby="entry-title">
          <p className="eyebrow">记下一笔</p>
          <h2 id="entry-title">新增收支</h2>
          <fieldset className="entry-tabs">
            <legend>记录类型</legend>
            {(['expense', 'income', 'transfer'] as const).map((entryKind) => (
              <button
                key={entryKind}
                type="button"
                aria-pressed={kind === entryKind}
                className={kind === entryKind ? 'selected' : ''}
                onClick={() => {
                  setKind(entryKind);
                  setSubmitError('');
                }}
              >
                {entryKind === 'income'
                  ? '收入'
                  : entryKind === 'expense'
                    ? '支出 / 刷卡消费'
                    : '账户转账'}
              </button>
            ))}
          </fieldset>
          <form onSubmit={submit}>
            <label htmlFor="entry-amount">
              金额{primaryAccount ? `（${primaryAccount.currency}）` : ''}
            </label>
            <input
              id="entry-amount"
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder={primaryAccount?.currency === 'JPY' ? '例如 1200' : '例如 12.50'}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setSubmitError('');
              }}
              required
              disabled={ledgerState !== 'ready' || saving}
            />
            <label htmlFor="primary-account">
              {kind === 'transfer' ? '转出账户' : kind === 'income' ? '收入账户' : '付款账户'}
            </label>
            <select
              id="primary-account"
              value={primaryAccountId}
              onChange={(event) => {
                setPrimaryAccountId(event.target.value);
                setSubmitError('');
              }}
              required
              disabled={ledgerState !== 'ready' || saving || primaryAccounts.length === 0}
            >
              {primaryAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.currency}
                </option>
              ))}
            </select>
            <label htmlFor="secondary-account">
              {kind === 'transfer' ? '转入账户' : kind === 'income' ? '收入来源' : '支出类别'}
            </label>
            <select
              id="secondary-account"
              value={secondaryAccountId}
              onChange={(event) => {
                setSecondaryAccountId(event.target.value);
                setSubmitError('');
              }}
              required
              disabled={ledgerState !== 'ready' || saving || secondaryAccounts.length === 0}
            >
              {secondaryAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.currency}
                </option>
              ))}
            </select>
            {kind === 'transfer' && (
              <p className="field-hint">转账只在相同币种账户间进行，不会计作收入或支出。</p>
            )}
            <label htmlFor="entry-time">日期与时间</label>
            <input
              id="entry-time"
              name="occurredAt"
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
              disabled={ledgerState !== 'ready' || saving}
            />
            <label htmlFor="entry-description">备注</label>
            <input
              id="entry-description"
              name="description"
              maxLength={200}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="例如：每月工资"
              required
              disabled={ledgerState !== 'ready' || saving}
            />
            {submitError && (
              <p className="inline-error" role="alert">
                {submitError}
              </p>
            )}
            {notice && (
              <p className="success-message" role="status">
                {notice}
              </p>
            )}
            <button
              className="submit-button"
              type="submit"
              disabled={
                ledgerState !== 'ready' ||
                saving ||
                !primaryAccounts.length ||
                !secondaryAccounts.length
              }
            >
              {saving ? '正在保存…' : '保存记录'}
            </button>
          </form>
          {accounts.length === 0 && ledgerState === 'ready' && (
            <p className="field-hint">请先创建账户和收入/支出分类，再添加记录。</p>
          )}
        </section>
      </main>
      <footer>
        <span>FinPath</span>
        <span>余额仅按各账户自身币种计算。</span>
      </footer>
    </div>
  );
}
