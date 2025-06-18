// 导入 WXT 的 defineConfig 方法，用于定义扩展的配置
import { defineConfig } from 'wxt';

// 使用 defineConfig 导出配置对象
export default defineConfig({
    // 指定扩展使用的 API 类型，'chrome' 表示使用 Chrome 扩展 API（兼容 Chromium 浏览器）
    extensionApi: 'chrome',

    // 指定源代码目录，默认为 'src'，所有前端代码（如 React/Vue）都放在这里
    srcDir: 'src',

    // 配置 WXT 模块，用于扩展功能
    modules: [
        '@wxt-dev/module-react', // 集成 React 支持（自动配置 React 相关构建）
        '@wxt-dev/auto-icons',   // 自动生成扩展图标（根据配置或默认图标）
    ],

    // 定义 manifest.json 的配置（核心扩展元数据）
    manifest: {
        // 扩展名称，使用国际化键名 "__MSG_extensionName__"
        // 实际名称在 _locales/en/messages.json 等文件中定义
        name: "__MSG_extensionName__",

        // 扩展描述，同样使用国际化键名
        description: "__MSG_extensionDescription__",

        // 默认语言（对应 _locales 中的子目录，如 'en'、'zh_CN'）
        default_locale: 'en',

        // 声明需要的 Chrome API 权限
        permissions: [
            'storage',       // 使用 chrome.storage 存储数据
            'bookmarks',     // 访问和操作书签（插件核心功能）
            'notifications', // 显示系统通知
        ],

        // 声明需要访问的域名（匹配的域名可跨域请求）
        host_permissions: [
            "https://*.github.com/",          // 允许访问 GitHub 主站
            "https://*.githubusercontent.com/", // 允许访问 GitHub 资源（如 raw 文件）
        ],

        // 可选域名权限（用户可选择是否授予）
        optional_host_permissions: [
            "*://*/*", // 允许请求任何域名（谨慎使用，上架商店时可能需要说明）
        ]
    }
});