import OptionsSync from 'webext-options-sync';
/* global OptionsSync */

/**
 * 配置信息存储 - 优先存储在 storage.sync，其次会降级到 storage.local
 */
export default new OptionsSync({
    defaults: {
        githubToken: '',
        gistID: '',
        gistFileName: 'BookmarkHub',
        enableNotify: true,
        githubURL: 'https://api.github.com',
    },

    // List of functions that are called when the extension is updated
    migrations: [
        (savedOptions, currentDefaults) => {
            // Perhaps it was renamed
            // if (savedOptions.colour) {
            //     savedOptions.color = savedOptions.colour;
            //delete savedOptions.colour;
            // }
        },

        // Integrated utility that drops any properties that don't appear in the defaults
        OptionsSync.migrations.removeUnused
    ],
    logging: false
});