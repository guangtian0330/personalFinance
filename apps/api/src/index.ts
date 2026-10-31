// Hono/Worker entry and runtime types are introduced in M00-02.
import { Hono } from 'hono';

// Portable Fetch app. The local Node listener is isolated in dev.ts.
const app = new Hono();

app.get('/health', (context) => {
  context.header('Cache-Control', 'no-store');
  return context.json({ status: 'ok', service: 'finpath-api' } as const);
});

export default app;
