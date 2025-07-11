
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/dudor/BookmarkHub">
    <img src="images/icon128.png" alt="BookmarkHub" >
  </a>

  <h1 align="center">BookmarkHub</h1>
  <p align="center">
    BookmarkHub 是一款浏览器插件，可以在不同浏览器之间同步你的书签。
    <br />
    <a href="https://github.com/dudor/BookmarkHub/issues">反馈问题</a>
    ·
    <a href="/README_cn.md">简体中文</a>
    ·
    <a href="/README.md">English</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">目录</h2></summary>
  <ol>
    <li><a href="#关于">关于</a></li>
    <li><a href="#功能">功能</a></li>
    <li><a href="#下载安装">下载安装</a></li>
    <li><a href="#使用方法">使用方法</a></li>
    <li><a href="#待实现的功能">待实现的功能</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## 关于 

BookmarkHub 是一款浏览器插件，可以在不同浏览器之间同步你的书签。

适用于各大主流浏览器，如 Chrome、Firefox、Microsoft Edge 等。

它使用 GitHub 的 Gist 记录来存储浏览器的书签，可以放心安全的使用。

![BookmarkHub](images/3.gif)

![BookmarkHub](images/1.png)

![BookmarkHub](images/2.png)

## 功能
* **多Gist支持**: 配置多个 GitHub Gist 或 Gitee Gist 配置
* **便捷管理**: 添加、编辑、删除不同的 Gist 配置
* **跨平台支持**: 同时支持 GitHub 和 Gitee 平台
* **无需注册**: 只需使用你的 GitHub/Gitee Token 和 Gist
* **一键同步**: 一键上传和下载书签
* **清空功能**: 一键清空所有本地书签
* **跨平台同步**: 支持跨机器和跨浏览器同步书签
* **书签计数**: 显示本地和远程书签数量
* **现代界面**: 美观直观的用户界面，带有流畅动画

## 下载安装
> 本插件需要把书签存储到 Gist 中，所以请确保有 GitHub 账号或可以通过网络注册 GitHub 账号。
* [Chrome 浏览器](https://chrome.google.com/webstore/detail/bookmarkhub-sync-bookmark/fohimdklhhcpcnpmmichieidclgfdmol)
* [Firefox 浏览器](https://addons.mozilla.org/zh-CN/firefox/addon/BookmarkHub/)
* [Microsoft Edge 浏览器](https://microsoftedge.microsoft.com/addons/detail/BookmarkHub/fdnmfpogadcljhecfhdikdecbkggfmgk)
* [其他基于 Chromium 内核的浏览器](https://chrome.google.com/webstore/detail/bookmarkhub-sync-bookmark/fohimdklhhcpcnpmmichieidclgfdmol)

## 最新版本新功能

### 🎨 增强的用户界面
- 现代渐变设计，带有流畅动画
- 改进的表单样式，提供更好的视觉反馈
- 响应式设计，适配不同屏幕尺寸
- 基于卡片的布局，带有悬停效果

### 🔧 多Gist配置
- **多配置支持**: 添加无限数量的 GitHub Gist 或 Gitee Gist 配置
- **便捷切换**: 一键激活不同的提供商
- **独立设置**: 每个配置都有自己的 token、Gist ID、文件名和文件夹设置
- **智能管理**: 安全删除配置，自动回退到第一个可用配置

### 🚀 改进的存储
- **结构化数据**: 支持多配置的新存储格式
- **向后兼容**: 自动从旧单配置格式迁移
- **更好组织**: GitHub 和 Gitee 配置分别存储

### 📁 文件夹管理
- **自定义文件夹**: 每个配置可以指定收藏夹根目录下的文件夹名
- **自动创建**: 如果文件夹不存在，会自动创建
- **独立同步**: 每个配置的书签会同步到对应的文件夹中

<!-- USAGE EXAMPLES -->
## 使用方法

### 基本设置

1. [登陆](https://github.com/login) GitHub，如果没有账号请点此[注册](https://github.com/join)。
2. [创建一个可以管理 gist 的 token](https://github.com/settings/tokens/new)。
3. [创建一个私有的 gist](https://gist.github.com)。__注意：如果是公开的 gist，你的书签是可以被他人搜索到的。__
4. 在浏览器的应用商店下载 BookmarkHub，点击插件的设置按钮，在弹出的设置窗口填入 token 和 gist ID，然后你就可以上传下载书签了。

### 多Gist配置

#### 设置多个配置

1. **打开选项页面**: 点击扩展图标并选择"设置"
2. **选择平台**: 在 GitHub 和 Gitee 标签页之间切换
3. **添加配置**: 点击"添加新配置"按钮
4. **配置设置**:
   - **名称**: 给你的配置一个描述性名称
   - **Token**: 你的 GitHub/Gitee 个人访问令牌
   - **Gist ID**: 你的 Gist 的 ID
   - **文件名**: Gist 中的文件名（默认: BookmarkHub）
   - **文件夹名**: 收藏夹根目录下的文件夹名（默认: BookmarkHub）
5. **激活提供商**: 在全局设置中选择要使用的提供商

#### 管理配置

- **切换提供商**: 在全局设置中点击 GitHub 或 Gitee 按钮来激活对应提供商
- **编辑**: 修改配置表单中的任何字段 - 更改会自动保存
- **删除**: 删除不再需要的配置（至少必须保留一个配置）
- **添加更多**: 为不同目的创建无限数量的配置

#### 获取令牌

- **GitHub**: 前往 [GitHub 设置 > 个人访问令牌](https://github.com/settings/tokens/new)
- **Gitee**: 前往 [Gitee 个人访问令牌](https://gitee.com/personal_access_tokens)

## 同步机制

### 上传书签
- 点击"上传书签"时，会遍历当前激活提供商的所有配置
- 将当前书签数据同步到每个配置的 Gist 文件中
- 如果某个配置失败，会继续处理其他配置

### 下载书签
- 点击"下载书签"时，会遍历当前激活提供商的所有配置
- 为每个配置在收藏夹根目录下创建对应的文件夹
- 将每个 Gist 文件的内容同步到对应的文件夹中
- 如果某个配置失败，会继续处理其他配置

### 文件夹管理
- 每个配置可以指定一个文件夹名
- 如果文件夹不存在，会自动创建
- 下载时会清空文件夹内容，然后重新创建书签
- 支持嵌套文件夹结构

<!-- ROADMAP -->
## 待实现的功能

- [ ] 自动同步书签
- [ ] 支持 webdav 协议
- [ ] 移动端
- [ ] 导入导出
- [ ] 分享书签


<!-- LICENSE -->
## License

See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

dudor

Project Link: [https://github.com/dudor/BookmarkHub](https://github.com/dudor/BookmarkHub)



