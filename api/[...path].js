const HOP_BY_HOP_HEADERS = new Set([
  'accept-encoding',
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export default async function handler(request, response) {
  const apiTarget = getApiTarget();

  if (!apiTarget) {
    return response.status(503).json({
      message: 'API não configurada. Defina API_PROXY_TARGET na Vercel.',
    });
  }

  try {
    const upstreamResponse = await fetch(buildUpstreamUrl(request.url, apiTarget), {
      method: request.method,
      headers: getUpstreamHeaders(request.headers),
      body: getRequestBody(request),
      redirect: 'manual',
    });

    response.status(upstreamResponse.status);
    copyResponseHeaders(upstreamResponse.headers, response);

    const body = Buffer.from(await upstreamResponse.arrayBuffer());
    return response.send(body);
  } catch (error) {
    console.error('Failed to proxy API request:', error);
    return response.status(502).json({
      message: 'Não foi possível conectar à API.',
    });
  }
}

export function getApiTarget(env = process.env) {
  const target = env.API_PROXY_TARGET || env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL;

  if (!target) {
    return null;
  }

  try {
    const url = new URL(target);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function buildUpstreamUrl(requestUrl, apiTarget) {
  const incomingUrl = new URL(requestUrl || '/api', 'https://vercel.local');
  const apiPath = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const targetBase = apiTarget.endsWith('/') ? apiTarget : `${apiTarget}/`;
  const upstreamUrl = new URL(apiPath, targetBase);
  upstreamUrl.search = incomingUrl.search;
  return upstreamUrl;
}

function getUpstreamHeaders(requestHeaders) {
  const headers = new Headers();

  for (const [name, value] of Object.entries(requestHeaders || {})) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value !== undefined) {
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  return headers;
}

function getRequestBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD' || request.body == null) {
    return undefined;
  }

  if (typeof request.body === 'string' || request.body instanceof Uint8Array) {
    return request.body;
  }

  return JSON.stringify(request.body);
}

function copyResponseHeaders(upstreamHeaders, response) {
  upstreamHeaders.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
      response.setHeader(name, value);
    }
  });

  const cookies = upstreamHeaders.getSetCookie?.() || [];
  if (cookies.length > 0) {
    response.setHeader('set-cookie', cookies);
  } else if (upstreamHeaders.has('set-cookie')) {
    response.setHeader('set-cookie', upstreamHeaders.get('set-cookie'));
  }
}
