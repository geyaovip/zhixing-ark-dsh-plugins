import { createPlugin, id, paging } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-crm';
export const inject = ['tools', 'credentials'];

const currency = { type: 'string', enum: ['CNY', 'USD', 'EUR', 'HKD'] };
const status = { type: 'string', maxLength: 40 };
const { page, page_size } = paging;
export const config = {
  app: 'crm',
  label: 'CRM',
  records: '处理运营任务草稿。fields 为 title、goal、planText。删除取消本人未提交草稿',
  tools: [
    ['crm_tasks', '查询运营任务和状态，以便获取真实 ID 和版本。', { page: paging.page, page_size: paging.page_size, status: { type: 'string', enum: ['draft','pending_confirmation','ready','in_progress','completed','cancelled'] } }],
    ['crm_task_detail', '读取可见运营任务的当前版本和方案。', { id }, ['id']],
    ['crm_workbench', '查询本人的线索、商机、跟进和服务待办摘要。结果有范围上限。'],
    ['crm_customers', '分页搜索有权客户及购买指标，获取真实客户 ID。', paging],
    ['crm_customer_detail', '按真实客户 ID 查询档案、脱敏联系方式及指定币种购买指标。', { id, currency }, ['id']],
    ['crm_customer_orders', '分页查询指定客户的订单、商品、退款和币种。', { page, page_size, customerId: id }, ['customerId']],
    ['crm_leads', '分页查询当前岗位可见的销售线索。', { ...paging, status }],
    ['crm_lead_detail', '按真实线索 ID 查询需求、状态和负责人。', { id }, ['id']],
    ['crm_opportunities', '查询销售商机、币种、下一行动与期限。overdue 为字符串 true 或 false。', {
      ...paging, customerId: id, stage: status, overdue: { type: 'string', enum: ['true', 'false'] },
    }],
    ['crm_opportunity_detail', '按真实商机 ID 查询阶段、预计金额和下一行动。', { id }, ['id']],
    ['crm_follow_ups', '分页查询明确渠道下的客户、线索或商机跟进记录。必须使用真实目标和渠道 ID。', {
      page, page_size, targetType: { type: 'string', enum: ['customer', 'lead', 'opportunity'] }, targetId: id, channelId: id,
    }, ['targetType', 'targetId', 'channelId']],
  ],
};
export const apply = createPlugin(config);
