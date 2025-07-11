import { Setting, GistConfig } from './setting'
import { getHttpInstance } from './http'
import ky from 'ky'

class BookmarkService {
    /**
     * 获取指定配置的Gist内容
     */
    async getConfig(config: GistConfig, provider: 'github' | 'gitee') {
        const gistID = config.gistID;
        const fileName = config.gistFileName;

        if (!gistID) {
            throw new Error('No Gist ID configured');
        }

        console.log(`[${new Date().toISOString()}] Getting Gist content for config: ${config.name}, Gist ID: ${gistID}, File: ${fileName}`);

        const http = getHttpInstance(config, provider);
        let resp = await http.get(`gists/${gistID}`).json() as any
        if (resp?.files) {
            let filenames = Object.keys(resp.files);
            console.log(`[${new Date().toISOString()}] Found files in Gist: ${filenames.join(', ')}`);

            if (filenames.indexOf(fileName) !== -1) {
                let gistFile = resp.files[fileName]
                if (gistFile.truncated) {
                    console.log(`[${new Date().toISOString()}] File ${fileName} is truncated, fetching raw content`);
                    // 对于截断的文件，使用fetch直接获取原始内容
                    const response = await fetch(gistFile.raw_url);
                    const txt = await response.text();
                    console.log(`[${new Date().toISOString()}] Successfully fetched truncated file content, length: ${txt.length}`);
                    return txt;
                } else {
                    console.log(`[${new Date().toISOString()}] Successfully got file content, length: ${gistFile.content.length}`);
                    return gistFile.content
                }
            } else {
                console.warn(`[${new Date().toISOString()}] File ${fileName} not found in Gist`);
            }
        } else {
            console.warn(`[${new Date().toISOString()}] No files found in Gist response`);
        }
        return null;
    }

    /**
     * 获取所有Gist（用于获取Gist列表）
     */
    async getAllGist(config: GistConfig, provider: 'github' | 'gitee') {
        console.log(`[${new Date().toISOString()}] Getting all Gists for config: ${config.name}`);
        const http = getHttpInstance(config, provider);
        const result = await http.get('gists').json();
        console.log(`[${new Date().toISOString()}] Found ${Array.isArray(result) ? result.length : 0} Gists`);
        return result;
    }

    /**
     * 更新指定配置的Gist
     */
    async updateConfig(config: GistConfig, provider: 'github' | 'gitee', data: any) {
        const gistID = config.gistID;
        if (!gistID) {
            throw new Error('No Gist ID configured');
        }

        console.log(`[${new Date().toISOString()}] Updating Gist for config: ${config.name}, Gist ID: ${gistID}`);
        const http = getHttpInstance(config, provider);
        const result = await http.patch(`gists/${gistID}`, { json: data }).json();
        console.log(`[${new Date().toISOString()}] Successfully updated Gist for config: ${config.name}`);
        return result;
    }

    /**
     * 兼容旧版本的方法
     */
    async get() {
        console.log(`[${new Date().toISOString()}] Using legacy get method`);
        const setting = await Setting.build();
        const configs = setting.getActiveConfigs();
        const provider = setting.getActiveProvider();
        if (configs.length === 0) {
            throw new Error('No configurations found');
        }
        console.log(`[${new Date().toISOString()}] Using first config: ${configs[0].name}`);
        return this.getConfig(configs[0], provider);
    }

    async update(data: any) {
        console.log(`[${new Date().toISOString()}] Using legacy update method`);
        const setting = await Setting.build();
        const configs = setting.getActiveConfigs();
        const provider = setting.getActiveProvider();
        if (configs.length === 0) {
            throw new Error('No configurations found');
        }
        console.log(`[${new Date().toISOString()}] Using first config: ${configs[0].name}`);
        return this.updateConfig(configs[0], provider, data);
    }
}

export default new BookmarkService()