import { createConnection } from './connection.mjs';

export const paging = {
  page: { type: 'integer', minimum: 1, maximum: 10000 },
  page_size: { type: 'integer', minimum: 1, maximum: 100 },
  q: { type: 'string', maxLength: 100 },
};
export const id = { type: 'string', pattern: '^[0-9a-fA-F-]{36}$' };

export function createPlugin(config) {
  const { app, label, tools } = config;
  return function apply(ctx) {
    const connection = createConnection(ctx.credentials, config);
    ctx.on('dispose', connection.dispose);

    function register(suffix, description, execute, properties = {}, required = []) {
      ctx.tools.register({
        name: 'ark_' + app + '_' + suffix,
        description,
        parameters: { type: 'object', properties, required, additionalProperties: false },
        output: {
          schema: { type: 'string' },
          render: (_args, value) => [{ type: 'text', text: value }],
        },
        execute: async args => {
          const value = await execute(args);
          return typeof value === 'string' ? value : JSON.stringify(value);
        },
      });
    }

    register('connect', '仅当用户明确要求连接知行方舟 ' + label + ' 或为该应用换企业时调用。打开浏览器，由用户选择企业并确认只读授权。', connection.start);
    register('connection_status', '查看知行方舟 ' + label + ' 的本机连接状态及撤权入口。需要确认所选企业和服务端权限时调用当前应用的 context 工具。', connection.status);
    register('cancel_connection', '仅在用户明确要求取消知行方舟 ' + label + ' 正在进行的浏览器授权时调用。', connection.cancel);
    register('context', '核对知行方舟 ' + label + ' 当前授权企业与只读范围。查询前可先核对企业。', () => connection.call('ark_context', {}));
    register('tools', '核对当前岗位在知行方舟 ' + label + ' 可用的只读业务工具。', () => connection.call('tools/list', {}));
    register('open_workbench', '获取知行方舟 ' + label + ' 的工作台入口。已授权时直达对应企业，其他情况提供登录入口。', async () => {
      const { saved } = await connection.status();
      if (!saved) return { url: 'https://zhixingark.cn/login' };
      const { tenantKey } = await connection.call('ark_context', {});
      return { url: 'https://zhixingark.cn/t/' + encodeURIComponent(tenantKey) + '/' + app };
    });

    for (const [remote, description, properties, required] of tools) {
      register(remote.slice(app.length + 1), '知行方舟 ' + label + '。' + description,
        args => connection.call(remote, args), properties, required);
    }
  };
}
