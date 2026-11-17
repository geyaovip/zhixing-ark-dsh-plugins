import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { describeTools, queryFailure } from '../shared/query-contract.mjs';

const origin = 'https://zhixingark.cn';
const scope = 'manufacturing.read';
const key = 'zhixing-ark/manufacturing';
const callbackPath = '/oauth/callback';
const pkce = () => randomBytes(32).toString('base64url');
const expectedTools = new Set([
  'ark_context', 'manufacturing_orders', 'manufacturing_order_status',
  'manufacturing_stock', 'manufacturing_trace',
]);
const connectHelp = '请在会话中要求连接知行方舟制造业进销存，然后在浏览器选择企业并确认只读授权。';

class RequestError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(url, options) {
  const signal = AbortSignal.timeout(15_000);
  const response = await fetch(url, { ...options, signal, redirect: 'error' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new RequestError('知行方舟请求失败（HTTP ' + response.status + '）。', response.status, body.error);
  }
  return response;
}

async function post(url, body) {
  const response = await request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

function grant(clientId, response) {
  if (
    response.scope !== scope || response.token_type !== 'Bearer' ||
    !/^[A-Za-z0-9_-]{43}$/.test(response.access_token ?? '') ||
    !/^[A-Za-z0-9_-]{43}$/.test(response.refresh_token ?? '') ||
    !Number.isInteger(response.expires_in) || response.expires_in < 1
  ) {
    throw new Error('知行方舟返回的授权范围或凭证无效。');
  }
  return {
    kind: 'grant',
    payload: {
      clientId, access: response.access_token, refresh: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    },
  };
}

async function openBrowser(url) {
  const command = process.platform === 'darwin' ? ['/usr/bin/open', url.href]
    : process.platform === 'win32' ? ['rundll32.exe', 'url.dll,FileProtocolHandler', url.href]
      : ['xdg-open', url.href];
  await new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), { stdio: 'ignore', windowsHide: true });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error('无法打开系统浏览器。')));
  });
}

function respond(response, status, message) {
  response.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Connection': 'close',
  });
  response.end('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>知行方舟</title><p>' + message + '</p>');
}

async function rpc(resource, method, params, access) {
  const id = randomBytes(12).toString('hex');
  const response = await request(resource, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': 'Bearer ' + access,
      'MCP-Protocol-Version': '2025-03-26',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const message = await response.json();
  if (message.jsonrpc === '2.0' && message.id === id && message.error?.code === -32602) {
    throw queryFailure({ structuredContent: { code: 'INVALID_INPUT' } });
  }
  if (message.jsonrpc !== '2.0' || message.id !== id || message.error || !message.result) {
    throw new Error('知行方舟 MCP 返回了无效结果。');
  }
  return message.result;
}

export function createConnection(credentials, options = {}) {
  const serviceOrigin = options.origin ?? origin;
  const launchBrowser = options.launchBrowser ?? openBrowser;
  const resource = serviceOrigin + '/api/v1/mcp/manufacturing';

  let pending;
  let latest;

  function close(attempt) {
    if (pending !== attempt) return;
    pending = undefined;
    clearTimeout(attempt.timer);
    attempt.server.close();
  }

  async function start() {
    if (pending) return '浏览器授权正在进行，请返回浏览器完成，或取消本次授权后重试。';

    const attempt = { verifier: pkce(), state: pkce(), busy: false };
    const server = createServer(async (req, res) => {
      const local = new URL(attempt.redirectUri);
      let target;
      try {
        target = new URL(req.url, local.origin);
      } catch {
        respond(res, 400, '无效的知行方舟授权回调。');
        return;
      }
      if (req.method !== 'GET' || req.headers.host !== local.host || target.origin !== local.origin ||
          target.pathname !== callbackPath || target.searchParams.get('state') !== attempt.state ||
          target.searchParams.get('iss') !== serviceOrigin) {
        respond(res, 400, '无效的知行方舟授权回调。');
        return;
      }
      if (attempt.busy || pending !== attempt) {
        respond(res, 409, '此授权请求正在处理或已结束。');
        return;
      }
      attempt.busy = true;
      try {
        const code = target.searchParams.get('code');
        if (target.searchParams.has('error') || !code) {
          latest = '授权未完成。可在 Harness 会话中重新发起。';
          respond(res, 400, latest);
          return;
        }
        await credentials.modifyRecord(key, async () => grant(attempt.clientId, await post(serviceOrigin + '/api/v1/oauth/token', {
          grant_type: 'authorization_code', client_id: attempt.clientId, code,
          code_verifier: attempt.verifier, redirect_uri: attempt.redirectUri, resource,
        })));
        latest = '制造业进销存只读授权成功，请返回 DeepSeek Harness 查询。';
        respond(res, 200, latest);
      } catch {
        latest = '授权凭证交换或保存失败。请重新发起授权。';
        respond(res, 502, latest);
      } finally {
        close(attempt);
      }
    });
    attempt.server = server;
    pending = attempt;
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      attempt.redirectUri = 'http://127.0.0.1:' + server.address().port + callbackPath;
      const client = await post(serviceOrigin + '/api/v1/oauth/register', {
        client_name: 'DeepSeek Harness · 知行方舟制造业进销存',
        redirect_uris: [attempt.redirectUri],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      });
      if (!/^[0-9a-f-]{36}$/i.test(client.client_id ?? '')) {
        throw new Error('知行方舟未返回有效的授权客户端。');
      }
      if (pending !== attempt) return latest;
      attempt.clientId = client.client_id;
      const authorization = new URL('/api/v1/oauth/authorize', serviceOrigin);
      authorization.search = new URLSearchParams({
        client_id: attempt.clientId, redirect_uri: attempt.redirectUri, response_type: 'code',
        code_challenge: createHash('sha256').update(attempt.verifier).digest('base64url'),
        code_challenge_method: 'S256', resource, scope, state: attempt.state,
      });
      latest = '已在浏览器打开授权页。请选择企业并确认只读权限，随后返回 Harness 查询。';
      attempt.timer = setTimeout(() => {
        if (attempt.busy) return;
        latest = '浏览器授权已超时，可以重新发起。';
        close(attempt);
      }, 9 * 60_000);
      await launchBrowser(authorization);
      return latest;
    } catch {
      close(attempt);
      latest = '无法启动知行方舟授权，请检查网络和系统默认浏览器后重试。';
      throw new Error(latest);
    }
  }

  async function getAccess() {
    const record = await credentials.readRecord(key);
    if (record?.kind !== 'grant') throw new Error('[AUTH_REQUIRED] ' + connectHelp);
    if (record.payload.expiresAt > Date.now() + 60_000) return record.payload.access;
    try {
      const fresh = await credentials.modifyRecord(key, async current => {
        if (current?.kind !== 'grant' || current.payload.expiresAt > Date.now() + 60_000) return undefined;
        const { clientId, refresh } = current.payload;
        return grant(clientId, await post(serviceOrigin + '/api/v1/oauth/token', {
          grant_type: 'refresh_token', client_id: clientId, refresh_token: refresh, resource,
        }));
      });
      if (fresh?.kind !== 'grant') throw new Error(connectHelp);
      return fresh.payload.access;
    } catch (error) {
      if (error.status === 401 || error.code === 'invalid_grant') {
        throw new Error('知行方舟连接已失效。' + connectHelp);
      }
      throw error;
    }
  }

  async function call(tool, args) {
    try {
      const access = await getAccess();
      if (tool === 'tools/list') {
        const result = await rpc(resource, tool, {}, access);
        return describeTools(result, expectedTools);
      }
      if (!expectedTools.has(tool)) throw new Error('此插件只支持指定的制造业查询。');
      const result = await rpc(resource, 'tools/call', { name: tool, arguments: args }, access);
      if (result.isError) {
        throw queryFailure(result);
      }
      return result.structuredContent ?? result.content;
    } catch (error) {
      if (error.status === 401) throw new Error('[AUTH_REQUIRED] 知行方舟连接已失效。' + connectHelp);
      if (error.status === 403) throw queryFailure({ structuredContent: { code: 'FORBIDDEN' } });
      if (error.status === 429) throw new Error('[RATE_LIMITED] 查询过于频繁，请稍后重试。');
      if (error.status >= 500 || ['TimeoutError', 'AbortError'].includes(error.name) || error instanceof TypeError) {
        throw queryFailure({ structuredContent: { code: 'UNAVAILABLE' } });
      }
      throw error;
    }
  }

  return {
    start,
    call,
    status: async (verify = false) => {
      const saved = (await credentials.describeRecord(key)).configured;
      let verified = false;
      let context;
      let verificationError;
      if (verify && saved && !pending) {
        try {
          const result = await call('ark_context', {});
          context = { appId: result.appId, tenantKey: result.tenantKey, tenantName: result.tenantName, scopes: result.scopes };
          verified = true;
        } catch (error) {
          verificationError = error.message;
        }
      }
      return {
        saved,
        pending: Boolean(pending),
        ...(verify ? { verified, context, verificationError } : {}),
        message: latest ?? (saved ? '本机已保存授权，查询时会核对服务端权限。' : '尚未发起授权。'),
        management: serviceOrigin + '/connect/connections',
      };
    },
    cancel: () => {
      if (pending?.busy) return '授权结果正在保存，完成后可在已连接应用管理授权。';
      if (pending) {
        close(pending);
        latest = '已取消本次授权。';
      }
      return latest ?? '当前没有进行中的浏览器授权。';
    },
    dispose: () => {
      if (pending) close(pending);
    },
  };
}
