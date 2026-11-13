import { createPlugin, id, paging } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-erp';
export const inject = ['tools', 'credentials'];

const status = { type: 'string', maxLength: 40 };
export const config = {
  app: 'erp',
  label: 'ERP',
  tools: [
    ['erp_master_search', '分页查询商品或供应商，获取用于查询的真实 ID。', { ...paging, kind: { type: 'string', enum: ['products', 'suppliers'] } }, ['kind']],
    ['erp_inventory_overview', '查询商品在库、待发、在途和补货量，按返回的时点和分页解释。', paging],
    ['erp_inventory_balances', '查询在库、预留和可用量。按仓库查询时使用真实仓库 ID。', { ...paging, warehouseId: id }],
    ['erp_purchase_list', '查询有权采购单及状态。审批通过与实物入库是两个节点。', { ...paging, status }],
    ['erp_purchase_detail', '按真实采购单 ID 查询订单行、已收数量、期限和状态。', { id }, ['id']],
    ['erp_sales_list', '分页查询销售合同及状态，可按实际客户 ID 或状态筛选。', { ...paging, partyId: id, status }],
    ['erp_sales_detail', '按真实销售合同 ID 查询订单行、已发数量和状态。', { id }, ['id']],
  ],
};
export const apply = createPlugin(config);
