import { Options } from 'webext-options-sync';
import optionsStorage from './optionsStorage'

export interface GistConfig {
    id: string;
    name: string;
    token: string;
    gistID: string;
    gistFileName: string;
    folderName?: string; // 收藏夹根目录下的文件夹名，默认配置不需要此字段
    isDefault?: boolean; // 是否为默认配置（用于上传本地书签）
}

export class SettingBase implements Options {
    constructor() { }
    [key: string]: string | number | boolean | GistConfig[] | any;
    activeProvider: 'github' | 'gitee' = 'github';
    enableNotify: boolean = true;
    githubConfigs: GistConfig[] = [];
    giteeConfigs: GistConfig[] = [];
    // 兼容旧版本
    githubToken: string = '';
    gistID: string = '';
    gistFileName: string = 'BookmarkHub';
    githubURL: string = 'https://api.github.com';
}

export class Setting extends SettingBase {
    private constructor() { super() }

    static async build() {
        // 读取配置信息
        let options = await optionsStorage.getAll();
        let setting = new Setting();

        // 设置新的配置结构
        setting.activeProvider = (options.activeProvider as 'github' | 'gitee') || 'github';
        setting.enableNotify = Boolean(options.enableNotify);
        setting.githubConfigs = (options.githubConfigs as GistConfig[]) || [];
        setting.giteeConfigs = (options.giteeConfigs as GistConfig[]) || [];

        // 兼容旧版本配置
        setting.gistID = String(options.gistID || '');
        setting.gistFileName = String(options.gistFileName || 'BookmarkHub');
        setting.githubToken = String(options.githubToken || '');

        return setting;
    }

    /**
     * 获取当前激活的提供商
     */
    getActiveProvider(): 'github' | 'gitee' {
        return this.activeProvider;
    }

    /**
     * 获取当前激活提供商的所有配置
     */
    getActiveConfigs(): GistConfig[] {
        return this.activeProvider === 'github' ? this.githubConfigs : this.giteeConfigs;
    }

    /**
     * 获取当前激活提供商的默认配置（用于上传）
     */
    getDefaultConfig(): GistConfig | undefined {
        const configs = this.getActiveConfigs();
        return configs.find(config => config.isDefault);
    }

    /**
     * 获取当前激活提供商的所有下载配置（非默认配置）
     */
    getDownloadConfigs(): GistConfig[] {
        const configs = this.getActiveConfigs();
        return configs.filter(config => !config.isDefault);
    }

    /**
     * 获取全局通知设置
     */
    getEnableNotify(): boolean {
        return this.enableNotify;
    }

    /**
     * 获取指定配置的token
     */
    getConfigToken(config: GistConfig): string {
        return config.token;
    }

    /**
     * 获取指定配置的gistID
     */
    getConfigGistID(config: GistConfig): string {
        return config.gistID;
    }

    /**
     * 获取指定配置的文件名
     */
    getConfigFileName(config: GistConfig): string {
        return config.gistFileName;
    }

    /**
     * 获取指定配置的文件夹名
     */
    getConfigFolderName(config: GistConfig): string {
        return config.folderName;
    }
}




// export class SettingBase {
//     constructor() { }
//     [key: string]: string | number | boolean;
//     githubToken: string = '';
//     gistID: string = '';
//     gistFileName: string = 'BookmarkHub';
//     enableNotify: boolean = true;
//     githubURL: string = 'https://api.github.com';
// }
// export class Setting extends SettingBase {
//     private constructor() { super() }
//     static async build() {
//         let options =new Setting();
//         let setting = new Setting();
//         setting.gistID = options.gistID;
//         setting.gistFileName = options.gistFileName;
//         setting.githubToken = options.githubToken;
//         setting.enableNotify = options.enableNotify;
//         return setting;
//     }
// }
