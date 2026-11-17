import { createPlugin, id } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-manufacturing';
export const inject = ['tools', 'credentials'];

const page = { type: 'integer', minimum: 1, maximum: 10000 };
const query = { type: 'string', maxLength: 80 };
export const apply = createPlugin({
  app: 'manufacturing',
  label: '制造业进销存',
  records: '处理待审核制造订单。新增 fields 为 number、customerId、materialId、warehouseId、quantity，可选 dueDate；修改 dueDate；删除取消本人待审核接单',
  tools: [
    ['manufacturing_catalog', '查询客户、成品和仓库，选取真实 ID。', { q: query, page }],
    ['manufacturing_orders', '按订单号、客户或成品查询制造订单。使用返回的真实订单 ID 查询详情；只传 q 和 page，固定每页 25 条。', { q: query, page }],
    ['manufacturing_order_status', '用真实订单 ID 查询物料缺口、在途、锁库、生产审核和出入库进度。', { id }, ['id']],
    ['manufacturing_stock', '查询库存和安全库存预警，区分实存、锁定和可用数量。alerts=true 只看预警；使用仓库 ID，固定每页 25 条。', { q: query, page, warehouseId: id, alerts: { type: 'boolean' } }],
    ['manufacturing_trace', '按准确的批次或序列号查询库存位置和生产、出入库关联。', { code: { type: 'string', minLength: 1, maxLength: 100 } }, ['code']],
  ],
});
