# 知行方舟CRM 跟进

查询客户、线索、商机、跟进和本人待办。需要在知行方舟开通相应应用，并有查询权限。

1. 在 DeepSeek Harness 打开「插件 → 已安装 → 添加插件」，粘贴 [1.0.0 安装链接](https://github.com/geyaovip/zhixing-ark-dsh-plugins/releases/download/apps-v1.0.0/dsh-plugin-zhixing-ark-crm-1.0.0.tgz)，或选择已下载的压缩包。安装后启用插件。
2. 在会话中说「连接知行方舟 CRM」。浏览器打开后核对发起的应用，选择企业并确认只读权限。现有共用授权页可能显示 WorkBuddy 字样。
3. 返回 Harness，说「看我有哪些需要跟进的商机」，或请插件打开工作台。新增跟进、分配线索或发送消息请在 CRM 工作台处理。

插件申请 `crm.read`，查询结果取决于企业和岗位权限。凭证由 Harness 的本机凭证服务管理，授权可在[知行方舟已连接应用](https://zhixingark.cn/connect/connections)撤销。工具结果进入 Harness 会话，由当前选用的模型处理。
