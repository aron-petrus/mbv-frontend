import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import handler, { buildUpstreamUrl, getApiTarget } from '../api/proxy.js';

test('uses the server-only API target before Vite variables', () => {
  assert.equal(
    getApiTarget({
      API_PROXY_TARGET: 'https://api.example.com',
      VITE_API_PROXY_TARGET: 'https://old.example.com',
    }),
    'https://api.example.com/',
  );
});

test('supports the existing Vite proxy target variable', () => {
  assert.equal(getApiTarget({ VITE_API_PROXY_TARGET: 'http://localhost:3001' }), 'http://localhost:3001/');
});

test('does not accept relative or non-http targets', () => {
  assert.equal(getApiTarget({ VITE_API_BASE_URL: '/api' }), null);
  assert.equal(getApiTarget({ API_PROXY_TARGET: 'file:///tmp/api' }), null);
});

test('removes the public /api prefix and preserves path and query string', () => {
  assert.equal(
    buildUpstreamUrl('/api/purchase-orders?limit=10&offset=20', 'https://backend.example.com').toString(),
    'https://backend.example.com/purchase-orders?limit=10&offset=20',
  );
});

test('preserves the identity route consumed by the shared production nginx', () => {
  assert.equal(
    buildUpstreamUrl(
      '/api/identity/v1/auth/login',
      'https://api.example.com',
    ).toString(),
    'https://api.example.com/identity/v1/auth/login',
  );
});

test('preserves a path prefix configured in the backend target', () => {
  assert.equal(
    buildUpstreamUrl('/api/auth/login', 'https://backend.example.com/v1').toString(),
    'https://backend.example.com/v1/auth/login',
  );
});

test('uses the path supplied by the Vercel rewrite without leaking routing parameters', () => {
  assert.equal(
    buildUpstreamUrl(
      '/api/proxy?api_path=auth%2Flogin&...path=ignored&source=test',
      'https://backend.example.com',
      'auth/login',
    ).toString(),
    'https://backend.example.com/auth/login?source=test',
  );
});

test('forwards a login request and returns the backend response', async () => {
  let resolveRequest;
  const receivedRequest = new Promise((resolve) => {
    resolveRequest = resolve;
  });
  const server = createServer((request, response) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      resolveRequest({
        authorization: request.headers.authorization,
        body: Buffer.concat(chunks).toString(),
        url: request.url,
      });
      response.statusCode = 201;
      response.setHeader('content-type', 'application/json');
      response.setHeader('x-upstream', 'ok');
      response.end(JSON.stringify({ accessToken: 'token' }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const previousTarget = process.env.API_PROXY_TARGET;
  process.env.API_PROXY_TARGET = `http://127.0.0.1:${address.port}`;

  const result = createMockResponse();

  try {
    await handler(
      {
        body: { email: 'user@example.com', password: 'password' },
        headers: {
          authorization: 'Bearer test',
          'content-length': '999',
          'content-type': 'application/json',
          host: 'frontend.example.com',
        },
        method: 'POST',
        query: { api_path: 'auth/login' },
        url: '/api/proxy?api_path=auth%2Flogin&source=test',
      },
      result.response,
    );

    const forwarded = await receivedRequest;
    assert.deepEqual(forwarded, {
      authorization: 'Bearer test',
      body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
      url: '/auth/login?source=test',
    });
    assert.equal(result.statusCode, 201);
    assert.equal(result.headers['x-upstream'], 'ok');
    assert.deepEqual(JSON.parse(result.body.toString()), { accessToken: 'token' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previousTarget === undefined) {
      delete process.env.API_PROXY_TARGET;
    } else {
      process.env.API_PROXY_TARGET = previousTarget;
    }
  }
});

function createMockResponse() {
  const result = {
    body: null,
    headers: {},
    statusCode: null,
  };

  result.response = {
    json(body) {
      result.body = Buffer.from(JSON.stringify(body));
      return this;
    },
    send(body) {
      result.body = body;
      return this;
    },
    setHeader(name, value) {
      result.headers[name] = value;
      return this;
    },
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
  };

  return result;
}
