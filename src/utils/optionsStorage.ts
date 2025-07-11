import OptionsSync from 'webext-options-sync';
/* global OptionsSync */

/**
 * 配置信息存储 - 优先存储在 storage.sync，其次会降级到 storage.local
 */
export default new OptionsSync({
    defaults: {
        // 当前激活的提供商（github 或 gitee）
        activeProvider: 'github',
        // 全局通知设置
        enableNotify: true,
        // GitHub 配置列表
        githubConfigs: [
            {
                id: 'default',
                name: 'Default GitHub Gist',
                token: '',
                gistID: '',
                gistFileName: 'BookmarkHub',
                folderName: 'BookmarkHub' // 收藏夹根目录下的文件夹名
            }
        ] as any,
        // Gitee 配置列表
        giteeConfigs: [
            {
                id: 'default',
                name: 'Default Gitee Gist',
                token: '',
                gistID: '',
                gistFileName: 'BookmarkHub',
                folderName: 'BookmarkHub' // 收藏夹根目录下的文件夹名
            }
        ] as any,
        // 兼容旧版本配置
        githubToken: '',
        gistID: '',
        gistFileName: 'BookmarkHub',
        githubURL: 'https://api.github.com',
    },

    // List of functions that are called when the extension is updated
    migrations: [
        (savedOptions, currentDefaults) => {
            // 迁移旧版本配置到新格式
            if (savedOptions.githubToken && !savedOptions.githubConfigs) {
                (savedOptions as any).githubConfigs = [{
                    id: 'migrated',
                    name: 'Migrated GitHub Gist',
                    token: savedOptions.githubToken,
                    gistID: savedOptions.gistID || '',
                    gistFileName: savedOptions.gistFileName || 'BookmarkHub',
                    folderName: 'BookmarkHub'
                }];
                (savedOptions as any).activeProvider = 'github';
                (savedOptions as any).enableNotify = Boolean(savedOptions.enableNotify);
            }
        },

        // Integrated utility that drops any properties that don't appear in the defaults
        OptionsSync.migrations.removeUnused
    ],
    logging: false
});