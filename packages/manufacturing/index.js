import { createConnection } from './connection.js';
import { normalizeQuery } from '../shared/query-contract.mjs';

export const name = 'zhixing-ark-manufacturing';
export const inject = ['tools', 'credentials'];

const page = { type: 'integer', minimum: 1, maximum: 10000 };
const query = { type: 'string', maxLength: 80 };
const id = { type: 'string', pattern: '^[0-9a-fA-F-]{36}$' };
const toolSpecs = [
  ['ark_manufacturing_context', '核对当前已授权的制造业进销存企业和只读权限。查询前优先使用。', 'ark_context', {}],
  ['ark_manufacturing_tools', '读取服务器实际开放的制造业进销存工具及只读标记。', 'tools/list', {}],
  ['ark_manufacturing_orders', '按订单号、客户或成品查询制造订单。使用返回的真实订单 ID 查询详情；只传 q 和 page，固定每页 25 条。', 'manufacturing_orders', { q: query, page }],
  ['ark_manufacturing_order_status', '用真实订单 ID 查询物料缺口、在途、锁库、生产审核和出入库进度。', 'manufacturing_order_status', { id }, ['id']],
  ['ark_manufacturing_stock', '查询库存和安全库存预警，区分实存、锁定和可用数量。alerts=true 只看预警；使用仓库 ID，固定每页 25 条。', 'manufacturing_stock', { q: query, page, warehouseId: id, alerts: { type: 'boolean' } }],
  ['ark_manufacturing_trace', '按准确的批次或序列号查询库存位置和生产、出入库关联。', 'manufacturing_trace', { code: { type: 'string', minLength: 1, maxLength: 100 } }, ['code']],
];

export function apply(ctx) {
  const connection = createConnection(ctx.credentials);
  ctx.on('dispose', connection.dispose);

  function register(name, description, execute, properties = {}, required = []) {
    ctx.tools.register({
      name,
      description,
      parameters: { type: 'object', properties, required, additionalProperties: false },
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      execute: async args => {
        const value = await execute(normalizeQuery(name.slice(4), args, properties, required));
        return typeof value === 'string' ? value : JSON.stringify(value);
      },
    });
  }

  register('ark_manufacturing_connect', '仅当用户明确要求连接或换企业时调用。打开系统浏览器，请用户选择企业并批准制造业进销存只读权限。', connection.start);
  register('ark_manufacturing_connection_status', '查看制造业进销存的本机连接状态和撤权入口。保存过凭证不表示企业授权仍有效，核对企业时使用 ark_manufacturing_context。', () => connection.status(true));
  register('ark_manufacturing_cancel_connection', '仅当用户要求取消正在进行的浏览器授权时调用。已建立的授权在知行方舟「已连接应用」中撤销。', connection.cancel);
  for (const [name, description, remote, properties, required] of toolSpecs) {
    register(name, description, args => connection.call(remote, args), properties, required);
  }
}
