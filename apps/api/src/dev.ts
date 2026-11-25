import { serve } from '@hono/node-server';
import { openLocalLedger } from '@finpath/persistence/local-sqlite';
import { createApp } from './index.ts';
import { createAuthProvider } from './auth.ts';

const authConfig = {
  runtime: 'local-node' as const,
  appEnv: process.env.APP_ENV,
  nodeEnv: process.env.NODE_ENV,
  mockAuth: process.env.MOCK_AUTH,
};

let localLedger: ReturnType<typeof openLocalLedger> | undefined;
let app: ReturnType<typeof createApp>;

try {
  createAuthProvider(authConfig);
} catch {
  console.error(
    'FinPath API: invalid auth configuration. Mock auth requires explicit local development.',
  );
  process.exit(1);
}

try {
  // Auth settings are validated before creating or seeding the local database.
  localLedger = openLocalLedger({
    ...(process.env.FINPATH_SQLITE_PATH ? { databasePath: process.env.FINPATH_SQLITE_PATH } : {}),
    seedDemoWorkspace: process.env.MOCK_AUTH === 'true',
  });
  app = createApp(authConfig, { ledger: localLedger.ledger });
} catch {
  localLedger?.close();
  console.error(
    'FinPath API: local ledger could not start. Check the local database path, migration files, and development authentication settings.',
  );
  process.exit(1);
}

if (!localLedger) process.exit(1);
const activeLedger = localLedger;

const portValue = process.env.PORT ?? '8787';
const port = Number(portValue);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  activeLedger.close();
  console.error('FinPath API: PORT must be a valid TCP port.');
  process.exit(1);
}

const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, () =>
  console.log(`FinPath API: http://127.0.0.1:${port}/health`),
);

server.on('error', (error: NodeJS.ErrnoException) => {
  activeLedger.close();
  console.error(
    error.code === 'EADDRINUSE'
      ? `FinPath API: port ${port} is occupied. Stop its owner before restarting.`
      : 'FinPath API could not start. Check the local runtime configuration.',
  );
  process.exitCode = 1;
});

function stop() {
  server.close(() => {
    activeLedger.close();
    process.exit(0);
  });
  if ('closeAllConnections' in server) server.closeAllConnections();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
