# 知行方舟品牌短视频脚本

提供商品和可核实的卖点，即可得到带时间轴的分镜、口播、字幕和拍摄清单。需要配音时可同时取得可复制的纯口播稿。Harness 使用当前模型生成文本。默认 30 秒、9:16，可指定时长和拍摄条件。

在 DeepSeek Harness 的「插件 → 已安装 → 添加插件」输入包名 `dsh-plugin-zhixing-ark-video-script`。npm 官方源和中国大陆镜像源均可安装 1.0.1。[npm 包](https://www.npmjs.com/package/dsh-plugin-zhixing-ark-video-script)

安装后新建会话，直接说「用品牌短视频脚本技能，给杯盖可拆洗的便携杯写 15 秒手机桌拍脚本」。本地调试也可输入安装包 `.tgz` 或本目录的绝对路径。

来源为知行方舟的商品短视频脚本技能，已适配 Harness 技能注册和调用。

1.0.1 新增纯口播稿，更新了工作台操作路径。登录后选择企业，在「品牌内容 → AI 工具」打开「文字配音」或「口播成片」。口播成片需要已授权的单人出镜 MP4，可下载 MP4、MP3 和 SRT。已有视频可通过字幕翻译与字幕压制添加译文，保留原声。音视频处理由用户在工作台提交。[打开知行方舟工作台](https://zhixingark.cn/login)

本地打包时，在此目录运行 `npm pack --ignore-scripts --pack-destination ../dist`。
