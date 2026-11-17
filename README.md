# 知行方舟 · DeepSeek Harness 插件

各插件可独立安装。已验证 DeepSeek Harness 0.2.2-rc.3 加载以下安装包。

打开「插件 → 已安装 → 添加插件」，粘贴下表对应的 GitHub 安装包链接。安装后启用插件。

| 插件 | 能力 | npm 包名 | GitHub 安装包 |
| --- | --- | --- | --- |
| [制造业进销存](packages/manufacturing) | 登录知行方舟并选择企业后，按岗位权限查询订单、缺料、库存预警、生产进度和批次追溯。仅申请只读授权。 | `dsh-plugin-zhixing-ark-manufacturing` | [制造业进销存 1.1.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-manufacturing-1.1.1.tgz) |
| [品牌短视频脚本](packages/product-video-script) | 根据商品卖点生成分镜、口播和字幕，提供可用于配音或口播成片的纯口播稿。 | `dsh-plugin-zhixing-ark-video-script` | [品牌短视频脚本 1.0.3](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-video-script-1.0.3.tgz) |
| [ERP 履约](packages/erp) | 按岗位权限查询库存、补货、采购和销售合同。 | `dsh-plugin-zhixing-ark-erp` | [ERP 履约 1.1.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-erp-1.1.1.tgz) |
| [CRM 跟进](packages/crm) | 按岗位权限查询客户、线索、商机、跟进和本人待办。 | `dsh-plugin-zhixing-ark-crm` | [CRM 跟进 1.1.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-crm-1.1.1.tgz) |
| [MES 生产跟踪](packages/mes) | 查询生产进度、工单、报工和已有 BOM。 | `dsh-plugin-zhixing-ark-mes` | [MES 生产跟踪 1.1.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-mes-1.1.1.tgz) |
| [GEO 品牌可见度](packages/geo) | 查询品牌项目和已有报告，解读样本、竞品与引用。 | `dsh-plugin-zhixing-ark-geo` | [GEO 品牌可见度 1.1.1](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.1/dsh-plugin-zhixing-ark-geo-1.1.1.tgz) |

也可以下载压缩包，再输入本地文件路径。通过 npm 包名安装时，请核对安装窗口显示的版本。

各企业应用的只读授权可在 [知行方舟已连接应用](https://zhixingark.cn/connect/connections) 管理。短视频脚本在对话中使用「品牌短视频脚本」技能生成，之后可在「品牌内容 → AI 工具」使用文字配音、口播成片和字幕工具。

ERP、CRM、MES 和 GEO 共用授权组件，五个业务插件共用参数检查。运行 `node packages/pack-apps.mjs` 可将六个独立安装包生成到 `packages/dist/`。

## 发布到 npm

使用发布提交生成安装包，为这次发布的每个 `.tgz` 生成 SHA-256 校验项，并把安装包和 `SHA256SUMS.txt` 一起上传到 GitHub Release 草稿。通过 GitHub 网页或已登录的 `gh` CLI 发布正式 Release 后，`publish-npm.yml` 会验证安装包、比对 npm 注册表并发布尚未上线的新版。每个插件独立提升版本号。

在 GitHub Actions 可以用正式 Release 的标签手动验证或重跑。默认只校验。已经发布且摘要一致的包会跳过，版本冲突会在提交前报错。六个包在 npm 里均使用此工作流的 Trusted Publishing 授权。
