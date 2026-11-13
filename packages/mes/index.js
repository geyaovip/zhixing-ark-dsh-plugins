import { createPlugin, id, paging } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-mes';
export const inject = ['tools', 'credentials'];

export const config = {
  app: 'mes',
  label: 'MES',
  tools: [
    ['mes_production_overview', '查询生产进度、逾期、待审核和不良，区分报工与审核。'],
    ['mes_list_records', '分页查询有权物料、已有 BOM、计划、工单或报工。status 用于非 materials，orderId 用于 reports，planId 用于 orders。', {
      ...paging, type: { type: 'string', enum: ['materials', 'boms', 'plans', 'orders', 'reports'] },
      status: { type: 'string', maxLength: 40 }, orderId: id, planId: id,
    }, ['type']],
    ['mes_inspect', '按真实 ID 查询有权物料、已有 BOM、计划、工单或报工的详情。关联记录有数量上限。', {
      type: { type: 'string', enum: ['material', 'bom', 'plan', 'order', 'report'] }, id,
    }, ['type', 'id']],
  ],
};
export const apply = createPlugin(config);
