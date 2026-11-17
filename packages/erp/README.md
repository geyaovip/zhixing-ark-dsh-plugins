# 知行方舟ERP 履约

查询商品库存、补货量、采购单和销售合同。需要在知行方舟开通相应应用，并有查询权限。

1. 在 DeepSeek Harness 打开「插件 → 已安装 → 添加插件」，粘贴 [1.1.0 安装链接](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/business-v1.1.0/dsh-plugin-zhixing-ark-erp-1.1.0.tgz)，或选择已下载的压缩包。安装后启用插件。
2. 在会话中说「连接知行方舟 ERP」。浏览器打开后核对发起的应用，选择企业并确认只读权限。授权页显示发起客户端、企业和当前应用的只读访问范围。
3. 返回 Harness，说「查 SKU 的库存与在途量」，或请插件打开工作台。入库、发货和审批请在 ERP 工作台处理。

插件申请 `erp.read`，查询结果取决于企业和岗位权限。凭证由 Harness 的本机凭证服务管理，授权可在[知行方舟已连接应用](https://zhixingark.cn/connect/connections)撤销。工具结果进入 Harness 会话，由当前选用的模型处理。
