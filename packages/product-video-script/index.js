import { readFileSync } from 'node:fs';
import { createPlugin, id, paging } from '../shared/plugin.mjs';

export const name = 'zhixing-ark-video-script';
export const inject = ['skills', 'tools', 'credentials'];

const contentTools = createPlugin({
  app: 'content',
  label: '品牌内容',
  records: '处理品牌内容项目。新增 fields 为 name 和 prompt，prompt 可填写已定稿脚本；修改 name 或 prompt；删除把项目移入回收站',
  tools: [
    ['content_projects', '按项目名称搜索有权项目。', { page: paging.page, q: paging.q }],
    ['content_project_detail', '读取项目需求与当前版本。', { id }, ['id']],
  ],
});

export function apply(ctx) {
  contentTools(ctx);
  const content = readFileSync(new URL('./SKILL.md', import.meta.url), 'utf8');
  ctx.skills.register({
    name: 'ark-product-video-script',
    description: '根据商品和已知卖点生成按秒拆分的品牌短视频脚本、分镜和字幕，按需提供可直接配音的纯口播稿。',
    source: 'runtime',
    content,
  });
}
