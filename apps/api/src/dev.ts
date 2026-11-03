import { serve } from '@hono/node-server';
import { createApp } from './index.ts';

function createLocalApp() {
  try {
    return createApp({
      runtime: 'local-node',
      appEnv: process.env.APP_ENV,
      nodeEnv: process.env.NODE_ENV,
      mockAuth: process.env.MOCK_AUTH,
    });
  } catch {
    console.error('FinPath API: invalid auth configuration. Mock auth requires explicit local development.');
    process.exit(1);
  }
}

const app = createLocalApp();

const server = serve(
  { fetch: app.fetch, hostname: '127.0.0.1', port: 8787 },
  () => console.log('FinPath API: http://127.0.0.1:8787/health'),
);

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'FinPath API: port 8787 is occupied. Stop its owner before restarting.'
    : 'FinPath API could not start. Check the local runtime configuration.');
  process.exitCode = 1;
});

function stop() {
  server.close(() => process.exit(0));
  if ('closeAllConnections' in server) server.closeAllConnections();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
