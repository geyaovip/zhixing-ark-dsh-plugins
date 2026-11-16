# 知行方舟 · DeepSeek Harness 插件

各插件可独立安装。支持 DeepSeek Harness 0.2.2-rc.2。

打开「插件 → 已安装 → 添加插件」，输入下表对应的 npm 包名。npm 官方源和中国大陆镜像源均可安装。安装完成后启用插件。

| 插件 | 能力 | npm 包名 | GitHub 安装包 |
| --- | --- | --- | --- |
| [制造业进销存](packages/manufacturing) | 登录知行方舟并选择企业后，按岗位权限查询订单、缺料、库存预警、生产进度和批次追溯。仅申请只读授权。 | `dsh-plugin-zhixing-ark-manufacturing` | [制造业进销存 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/v1.0.0/dsh-plugin-zhixing-ark-manufacturing-1.0.0.tgz) |
| [品牌短视频脚本](packages/product-video-script) | 根据商品卖点生成分镜、口播和字幕，提供可用于配音或口播成片的纯口播稿。 | `dsh-plugin-zhixing-ark-video-script` | [品牌短视频脚本 1.0.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/video-script-v1.0.1/dsh-plugin-zhixing-ark-video-script-1.0.1.tgz) |
| [ERP 履约](packages/erp) | 按岗位权限查询库存、补货、采购和销售合同。 | `dsh-plugin-zhixing-ark-erp` | [ERP 履约 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/apps-v1.0.0/dsh-plugin-zhixing-ark-erp-1.0.0.tgz) |
| [CRM 跟进](packages/crm) | 按岗位权限查询客户、线索、商机、跟进和本人待办。 | `dsh-plugin-zhixing-ark-crm` | [CRM 跟进 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/apps-v1.0.0/dsh-plugin-zhixing-ark-crm-1.0.0.tgz) |
| [MES 生产跟踪](packages/mes) | 查询生产进度、工单、报工和已有 BOM。 | `dsh-plugin-zhixing-ark-mes` | [MES 生产跟踪 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/apps-v1.0.0/dsh-plugin-zhixing-ark-mes-1.0.0.tgz) |
| [GEO 品牌可见度](packages/geo) | 查询品牌项目和已有报告，解读样本、竞品与引用。 | `dsh-plugin-zhixing-ark-geo` | [GEO 品牌可见度 1.0.0](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/apps-v1.0.0/dsh-plugin-zhixing-ark-geo-1.0.0.tgz) |

也可以在同一窗口粘贴 GitHub 安装包链接，或下载后输入本地压缩包的路径。

各企业应用的只读授权可在 [知行方舟已连接应用](https://zhixingark.cn/connect/connections) 管理。短视频脚本在对话中使用「品牌短视频脚本」技能生成，之后可在「品牌内容 → AI 工具」使用文字配音、口播成片和字幕工具。

ERP、CRM、MES 和 GEO 的源码共用授权组件。运行 `node packages/pack-apps.mjs` 可将四个独立安装包生成到 `packages/dist/`。
