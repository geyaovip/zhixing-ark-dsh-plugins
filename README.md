# 知行方舟 · DeepSeek Harness 插件

两个插件可独立安装，均在 DeepSeek Harness 0.2.2-rc.2 验证。

| 插件 | 能力 | 安装包 |
| --- | --- | --- |
| [制造业进销存](packages/manufacturing) | 登录知行方舟并选择企业后，按岗位权限查询订单、缺料、库存预警、生产进度和批次追溯。仅申请只读授权。 | [制造业进销存 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/v1.0.0/dsh-plugin-zhixing-ark-manufacturing-1.0.0.tgz) |
| [品牌短视频脚本](packages/product-video-script) | 根据商品卖点生成分镜、口播和字幕，并提供知行方舟工作台入口。使用 Harness 当前模型生成文本。 | [品牌短视频脚本 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/v1.0.0/dsh-plugin-zhixing-ark-video-script-1.0.0.tgz) |

在 Harness 中打开「插件 → 已安装 → 添加插件」，粘贴对应的安装包链接，也可以先下载，再输入本地压缩包的路径。安装完成后启用插件。

制造业进销存的企业授权可在 [知行方舟已连接应用](https://zhixingark.cn/connect/connections) 管理。短视频脚本在对话中使用「品牌短视频脚本」技能生成，之后可到工作台继续制作视频。
