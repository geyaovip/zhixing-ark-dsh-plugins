import { readFileSync } from 'node:fs';

export const name = 'zhixing-ark-video-script';
export const inject = ['skills'];

export function apply(ctx) {
  const content = readFileSync(new URL('./SKILL.md', import.meta.url), 'utf8');
  ctx.skills.register({
    name: 'ark-product-video-script',
    description: '根据商品和已知卖点生成按秒拆分的品牌短视频脚本、分镜和字幕，按需提供可直接配音的纯口播稿。',
    source: 'runtime',
    content,
  });
}
