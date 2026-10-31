import { useEffect, useState } from 'react';
import { checkApiHealth } from './api-health.js';

type Connection = 'checking' | 'connected' | 'unavailable';

const messages = {
  checking: { title: '正在检查连接', detail: '正在确认本地服务是否可用。' },
  connected: { title: '服务已连接', detail: '页面已成功连接本地服务，可以继续开发。' },
  unavailable: { title: '暂时无法连接', detail: '请确认本地服务已启动，然后重新检查。' },
} satisfies Record<Connection, { title: string; detail: string }>;

export function App() {
  const [connection, setConnection] = useState<Connection>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setConnection('checking');
    void checkApiHealth(controller.signal).then(
      () => { if (!controller.signal.aborted) setConnection('connected'); },
      () => { if (!controller.signal.aborted) setConnection('unavailable'); },
    );
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="FinPath 首页">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M7 25V16h8V7h10M15 7v18M7 16h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          FinPath
        </a>
        <span className="environment">本地开发预览</span>
      </header>

      <main>
        <section className="welcome" aria-labelledby="welcome-title">
          <p className="eyebrow">从这里，开始下一步</p>
          <h1 id="welcome-title">为每一步，<br />留出空间。</h1>
          <p className="introduction">让日常收支与未来目标，逐渐有迹可循。<br className="desktop-break" />FinPath 的旅程，从一个稳妥的起点开始。</p>
          <div className="preview-note">
            <span className="note-line" aria-hidden="true" />
            <p>当前为基础页面预览。账户、预算与目标功能将在后续逐步开放。</p>
          </div>
        </section>

        <section className={`connection-card ${connection}`} aria-labelledby="connection-heading">
          <div className="card-heading">
            <span className="eyebrow">连接状态</span>
            <span className="status-dot" aria-hidden="true" />
          </div>
          <div className="connection-message" role="status" aria-live="polite" aria-atomic="true">
            <h2 id="connection-heading">{messages[connection].title}</h2>
            <p>{messages[connection].detail}</p>
          </div>
          <button
            type="button"
            disabled={connection === 'checking'}
            onClick={() => { setConnection('checking'); setAttempt((value) => value + 1); }}
          >
            {connection === 'checking' ? '检查中…' : '重新检查'}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="card-footnote">仅检查连接，不读取或保存财务信息。</p>
        </section>
      </main>

      <footer><span>FinPath</span><span>一步一步，走向你的计划。</span></footer>
    </div>
  );
}
