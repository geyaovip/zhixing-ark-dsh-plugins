import { createPlugin, id, paging } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-geo';
export const inject = ['tools', 'credentials'];

export const config = {
  app: 'geo',
  label: 'GEO 品牌可见度',
  records: '处理 GEO 项目。fields 为 name、brandName、aliases、competitors、website、country、language、timezone；删除停用项目及监测计划',
  tools: [
    ['geo_project_detail', '查询项目配置和版本。', { id }, ['id']],
    ['geo_projects', '分页搜索获授权的项目、品牌、地域与语言，获取真实项目 ID。', paging],
    ['geo_reports', '按真实项目 ID 查询已有分析和报告状态，获取分析 ID。', { ...paging, projectId: id }, ['projectId']],
    ['geo_report_summary', '按真实分析 ID 解读已有报告的样本口径、品牌评分、竞品缺席、引用域名与复测可比性。', { id }, ['id']],
  ],
};
export const apply = createPlugin(config);
