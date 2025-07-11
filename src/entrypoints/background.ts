import BookmarkService from '../utils/services'
import { Setting, GistConfig } from '../utils/setting'
import iconLogo from '../assets/icon.png'
import { OperType, BookmarkInfo, SyncDataInfo, RootBookmarksType, BrowserType } from '../utils/models'
import { Bookmarks } from 'wxt/browser'

// 定义后台脚本主入口
export default defineBackground(() => {

    // 扩展安装时的监听器
    browser.runtime.onInstalled.addListener(c => {
        // 可以在这里添加初始化逻辑
        console.log(`[${new Date().toISOString()}] Extension installed`);
        refreshLocalCount();
    });

    // 当前操作类型和浏览器类型
    let curOperType = OperType.NONE; // 当前操作类型（无/同步/删除）
    let curBrowserType = BrowserType.CHROME; // 当前浏览器类型（默认Chrome）

    /**
     * 消息监听器 - 处理来自popup的各种操作请求
     * 包括：上传、下载、删除所有、设置
     */
    browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        console.log(`[${new Date().toISOString()}] Received message: ${msg.name}`);

        // 上传书签到Gist
        if (msg.name === 'upload') {
            if (curOperType !== OperType.NONE) {
                console.log(`[${new Date().toISOString()}] Operation already in progress, skipping upload request`);
                sendResponse(false);
                return true;
            }

            curOperType = OperType.SYNC
            uploadBookmarks().then(() => {
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" }); // 清除徽章
                refreshLocalCount(); // 刷新本地计数
                sendResponse(true); // 发送响应
            }).catch((error) => {
                console.error(`[${new Date().toISOString()}] Upload operation failed:`, error);
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" });
                sendResponse(false);
            });
        }
        // 从Gist下载书签
        if (msg.name === 'download') {
            if (curOperType !== OperType.NONE) {
                console.log(`[${new Date().toISOString()}] Operation already in progress, skipping download request`);
                sendResponse(false);
                return true;
            }

            curOperType = OperType.SYNC
            downloadBookmarks().then(() => {
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" });
                refreshLocalCount();
                sendResponse(true);
            }).catch((error) => {
                console.error(`[${new Date().toISOString()}] Download operation failed:`, error);
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" });
                sendResponse(false);
            });
        }
        // 删除所有书签
        if (msg.name === 'removeAll') {
            if (curOperType !== OperType.NONE) {
                console.log(`[${new Date().toISOString()}] Operation already in progress, skipping remove request`);
                sendResponse(false);
                return true;
            }

            curOperType = OperType.REMOVE
            clearBookmarkTree().then(() => {
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" });
                refreshLocalCount();
                sendResponse(true);
            }).catch((error) => {
                console.error(`[${new Date().toISOString()}] Remove operation failed:`, error);
                curOperType = OperType.NONE
                browser.action.setBadgeText({ text: "" });
                sendResponse(false);
            });
        }
        // 打开设置页面
        if (msg.name === 'setting') {
            browser.runtime.openOptionsPage().then(() => {
                sendResponse(true);
            });
        }
        return true; // 保持消息通道开放用于异步响应
    });

    // 书签创建监听器 - 标记本地修改
    browser.bookmarks.onCreated.addListener((id, info) => {
        if (curOperType === OperType.NONE) {
            console.log(`[${new Date().toISOString()}] Bookmark created: ${info.title}`);
            browser.action.setBadgeText({ text: "!" }); // 显示修改标记
            browser.action.setBadgeBackgroundColor({ color: "#F00" }); // 红色背景
            refreshLocalCount(); // 刷新本地计数
        }
    });

    // 书签修改监听器
    browser.bookmarks.onChanged.addListener((id, info) => {
        if (curOperType === OperType.NONE) {
            console.log(`[${new Date().toISOString()}] Bookmark changed: ${info.title}`);
            browser.action.setBadgeText({ text: "!" });
            browser.action.setBadgeBackgroundColor({ color: "#F00" });
        }
    })

    // 书签移动监听器
    browser.bookmarks.onMoved.addListener((id, info) => {
        if (curOperType === OperType.NONE) {
            console.log(`[${new Date().toISOString()}] Bookmark moved: ${info.parentId}`);
            browser.action.setBadgeText({ text: "!" });
            browser.action.setBadgeBackgroundColor({ color: "#F00" });
        }
    })

    // 书签删除监听器
    browser.bookmarks.onRemoved.addListener((id, info) => {
        if (curOperType === OperType.NONE) {
            console.log(`[${new Date().toISOString()}] Bookmark removed: ${info.parentId}`);
            browser.action.setBadgeText({ text: "!" });
            browser.action.setBadgeBackgroundColor({ color: "#F00" });
            refreshLocalCount();
        }
    })

    /**
     * 创建或获取文件夹
     */
    async function createOrGetFolder(folderName: string): Promise<string> {
        try {
            console.log(`[${new Date().toISOString()}] Creating or getting folder: ${folderName}`);
            // 获取书签根节点
            const bookmarkTree = await browser.bookmarks.getTree();
            const rootId = bookmarkTree[0].id;

            // 查找是否已存在同名文件夹
            const children = await browser.bookmarks.getChildren(rootId);
            const existingFolder = children.find(child =>
                child.title === folderName && child.url === undefined
            );

            if (existingFolder) {
                console.log(`[${new Date().toISOString()}] Found existing folder: ${folderName} (ID: ${existingFolder.id})`);
                return existingFolder.id;
            }

            // 创建新文件夹 - 使用"其他书签"作为父文件夹
            const otherBookmarksId = bookmarkTree[0].children?.find(child =>
                child.title === "其他书签" || child.title === "Other Bookmarks"
            )?.id || rootId;

            const newFolder = await browser.bookmarks.create({
                parentId: otherBookmarksId,
                title: folderName
            });

            console.log(`[${new Date().toISOString()}] Created new folder: ${folderName} (ID: ${newFolder.id})`);
            return newFolder.id;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error creating folder:`, error);
            throw error;
        }
    }

    /**
     * 清空文件夹内容
     */
    async function clearFolder(folderId: string) {
        try {
            console.log(`[${new Date().toISOString()}] Clearing folder: ${folderId}`);
            const children = await browser.bookmarks.getChildren(folderId);
            for (const child of children) {
                await browser.bookmarks.removeTree(child.id);
            }
            console.log(`[${new Date().toISOString()}] Cleared ${children.length} items from folder`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error clearing folder:`, error);
            throw error;
        }
    }

    /**
     * 上传书签到默认配置的Gist
     * 1. 验证设置
     * 2. 获取当前书签
     * 3. 格式化同步数据
     * 4. 更新默认配置的Gist
     * 5. 更新远程计数
     */
    async function uploadBookmarks() {
        try {
            console.log(`[${new Date().toISOString()}] Starting upload bookmarks`);

            // 获取配置信息
            let setting = await Setting.build()
            const defaultConfig = setting.getDefaultConfig();

            // 验证必要设置
            if (!defaultConfig) throw new Error("未找到默认Gist配置");

            console.log(`[${new Date().toISOString()}] Found default configuration: ${defaultConfig.name}`);

            if (defaultConfig.token == '') throw new Error(`配置 ${defaultConfig.name} 未找到Gist Token`);
            if (defaultConfig.gistID == '') throw new Error(`配置 ${defaultConfig.name} 未找到Gist ID`);
            if (defaultConfig.gistFileName == '') throw new Error(`配置 ${defaultConfig.name} 未找到Gist文件名`);

            // 获取并格式化书签工具栏内容
            let bookmarks = await getToolbarBookmarks();
            let syncdata = new SyncDataInfo();
            syncdata.version = browser.runtime.getManifest().version; // 扩展版本
            syncdata.createDate = Date.now(); // 当前时间戳
            syncdata.bookmarks = formatBookmarks(bookmarks); // 格式化书签
            syncdata.browser = navigator.userAgent; // 浏览器信息

            console.log(`[${new Date().toISOString()}] Formatted bookmarks data, total bookmarks: ${getBookmarkCount(syncdata.bookmarks)}`);

            // 上传到默认配置
            try {
                console.log(`[${new Date().toISOString()}] Uploading to default config: ${defaultConfig.name} (Gist ID: ${defaultConfig.gistID})`);

                await BookmarkService.updateConfig(defaultConfig, setting.getActiveProvider(), {
                    files: {
                        [defaultConfig.gistFileName]: {
                            content: JSON.stringify(syncdata) // JSON序列化
                        }
                    },
                    description: defaultConfig.gistFileName
                });

                console.log(`[${new Date().toISOString()}] Successfully uploaded to ${defaultConfig.name}`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to upload to ${defaultConfig.name}:`, error);
                throw error; // 上传失败时抛出错误
            }

            // 更新存储的远程计数
            const count = getBookmarkCount(syncdata.bookmarks);
            await browser.storage.local.set({ remoteCount: count });

            // 如果启用通知则显示成功消息
            if (setting.getEnableNotify()) {
                const iconPath = chrome.runtime.getURL('icons/128.png');
                console.log(`[${new Date().toISOString()}] Try notification with iconPath:`, iconPath);
                try {
                    await browser.notifications.create({
                        type: "basic",
                        iconUrl: iconPath,
                        title: browser.i18n.getMessage('uploadBookmarks'),
                        message: `Successfully uploaded to ${defaultConfig.name}`
                    });
                    await new Promise(r => setTimeout(r, 1000));
                    console.log(`[${new Date().toISOString()}] Upload notification created successfully`);
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Failed to create upload notification:`, error);
                }
            } else {
                console.log(`[${new Date().toISOString()}] Notifications disabled, skipping upload notification`);
            }

            console.log(`[${new Date().toISOString()}] Upload completed successfully`);
        }
        catch (error: any) {
            console.error(`[${new Date().toISOString()}] Upload error:`, error);
            // 显示错误通知
            await browser.notifications.create({
                type: "basic",
                iconUrl: iconLogo,
                title: browser.i18n.getMessage('uploadBookmarks'),
                message: `${browser.i18n.getMessage('error')}：${error.message}`
            });
        }
    }

    /**
     * 从下载配置的Gist下载书签
     * 1. 获取所有下载配置的Gist数据
     * 2. 验证数据有效性
     * 3. 为每个配置创建对应的文件夹
     * 4. 在对应文件夹下创建书签树
     * 5. 更新远程计数
     */
    async function downloadBookmarks() {
        try {
            console.log(`[${new Date().toISOString()}] Starting download bookmarks`);

            let setting = await Setting.build()
            const downloadConfigs = setting.getDownloadConfigs();

            if (downloadConfigs.length === 0) {
                throw new Error("未找到下载Gist配置");
            }

            console.log(`[${new Date().toISOString()}] Found ${downloadConfigs.length} download configurations`);

            let totalBookmarks = 0;
            let successCount = 0;

            // 遍历所有下载配置下载书签
            for (const config of downloadConfigs) {
                try {
                    console.log(`[${new Date().toISOString()}] Downloading from config: ${config.name} (Gist ID: ${config.gistID})`);

                    let gist = await BookmarkService.getConfig(config, setting.getActiveProvider());
                    if (gist) {
                        console.log(`[${new Date().toISOString()}] Gist content for ${config.name}:`, gist);

                        let syncdata: SyncDataInfo = JSON.parse(gist);
                        // 验证书签数据
                        if (syncdata.bookmarks == undefined || syncdata.bookmarks.length == 0) {
                            console.warn(`[${new Date().toISOString()}] Gist文件 ${config.gistFileName} 为空`);
                            continue;
                        }

                        console.log(`[${new Date().toISOString()}] Parsed sync data for ${config.name}, bookmarks count: ${getBookmarkCount(syncdata.bookmarks)}`);

                        // 检查是否有文件夹名配置
                        if (!config.folderName) {
                            console.warn(`[${new Date().toISOString()}] Config ${config.name} has no folder name, skipping`);
                            continue;
                        }

                        // 创建或获取文件夹
                        const folderId = await createOrGetFolder(config.folderName);

                        // 清空文件夹内容
                        await clearFolder(folderId);

                        // 在文件夹下创建书签树
                        await createBookmarkTreeInFolder(syncdata.bookmarks, folderId);

                        totalBookmarks += getBookmarkCount(syncdata.bookmarks);
                        successCount++;

                        console.log(`[${new Date().toISOString()}] Successfully downloaded from ${config.name}`);
                    } else {
                        console.warn(`[${new Date().toISOString()}] No gist content found for ${config.name}`);
                    }
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Failed to download from ${config.name}:`, error);
                    // 继续处理其他配置，不中断整个流程
                }
            }

            if (successCount === 0) {
                throw new Error("所有配置下载失败");
            }

            // 更新计数
            await browser.storage.local.set({ remoteCount: totalBookmarks });

            // 成功通知
            if (setting.getEnableNotify()) {
                const iconPath = chrome.runtime.getURL('icons/128.png');
                console.log(`[${new Date().toISOString()}] Try notification with iconPath:`, iconPath);
                try {
                    await browser.notifications.create({
                        type: "basic",
                        iconUrl: iconPath,
                        title: browser.i18n.getMessage('downloadBookmarks'),
                        message: `Successfully downloaded from ${successCount} download configuration(s)`
                    });
                    await new Promise(r => setTimeout(r, 1000));
                    console.log(`[${new Date().toISOString()}] Download notification created successfully`);
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Failed to create download notification:`, error);
                }
            } else {
                console.log(`[${new Date().toISOString()}] Notifications disabled, skipping download notification`);
            }

            console.log(`[${new Date().toISOString()}] Download completed successfully, total bookmarks: ${totalBookmarks}`);
        }
        catch (error: any) {
            console.error(`[${new Date().toISOString()}] Download error:`, error);
            // 错误通知
            await browser.notifications.create({
                type: "basic",
                iconUrl: iconLogo,
                title: browser.i18n.getMessage('downloadBookmarks'),
                message: `${browser.i18n.getMessage('error')}：${error.message}`
            });
        }
    }

    /**
     * 获取浏览器书签树并检测浏览器类型
     */
    async function getBookmarks() {
        console.log(`[${new Date().toISOString()}] Getting bookmarks tree`);
        let bookmarkTree: BookmarkInfo[] = await browser.bookmarks.getTree();
        // 根据根节点ID判断浏览器类型
        if (bookmarkTree && bookmarkTree[0].id === "root________") {
            curBrowserType = BrowserType.FIREFOX;
            console.log(`[${new Date().toISOString()}] Detected browser type: Firefox`);
        }
        else {
            curBrowserType = BrowserType.CHROME;
            console.log(`[${new Date().toISOString()}] Detected browser type: Chrome`);
        }
        return bookmarkTree;
    }

    /**
 * 获取书签工具栏内容（用于上传）
 */
    async function getToolbarBookmarks() {
        console.log(`[${new Date().toISOString()}] Getting toolbar bookmarks`);
        let bookmarkTree: BookmarkInfo[] = await browser.bookmarks.getTree();

        // 调试：打印根节点的所有子节点信息
        console.log(`[${new Date().toISOString()}] Root node children:`, bookmarkTree[0]?.children?.map(child => ({
            id: child.id,
            title: child.title,
            url: child.url
        })));

        // 查找书签工具栏 - 尝试多种可能的名称和ID
        const toolbarFolder = bookmarkTree[0]?.children?.find(child =>
            child.title === "书签工具栏" ||
            child.title === "Bookmarks Bar" ||
            child.title === "Bookmark Bar" ||
            child.title === "书签栏" ||
            child.id === "toolbar_____" ||
            child.id === "1" // Chrome中工具栏的ID通常是"1"
        );

        if (!toolbarFolder) {
            console.warn(`[${new Date().toISOString()}] Toolbar folder not found, returning empty array`);
            console.warn(`[${new Date().toISOString()}] Available folders:`, bookmarkTree[0]?.children?.map(c => `${c.title} (${c.id})`));
            return [];
        }

        console.log(`[${new Date().toISOString()}] Found toolbar folder: ${toolbarFolder.title} (ID: ${toolbarFolder.id})`);

        // 获取工具栏的子项
        const toolbarChildren = await browser.bookmarks.getChildren(toolbarFolder.id);
        console.log(`[${new Date().toISOString()}] Toolbar has ${toolbarChildren.length} items`);

        return [toolbarFolder];
    }

    /**
     * 清空书签树（保留根节点）
     */
    async function clearBookmarkTree() {
        try {
            console.log(`[${new Date().toISOString()}] Starting clear bookmark tree`);

            let setting = await Setting.build()
            const activeConfigs = setting.getActiveConfigs();

            // 验证设置
            if (activeConfigs.length === 0) throw new Error("未找到Gist配置");

            for (const config of activeConfigs) {
                if (config.token == '') throw new Error(`配置 ${config.name} 未找到Gist Token`);
                if (config.gistID == '') throw new Error(`配置 ${config.name} 未找到Gist ID`);
                if (config.gistFileName == '') throw new Error(`配置 ${config.name} 未找到Gist文件名`);
            }

            // 获取所有书签节点
            let bookmarkTree: BookmarkInfo[] = await browser.bookmarks.getTree();
            let rootId = bookmarkTree[0]?.id;
            if (!rootId) throw new Error("未找到书签根节点");

            // 获取根节点的子节点
            let children = await browser.bookmarks.getChildren(rootId);

            // 删除所有子节点（保留根节点）
            for (let child of children) {
                if (child.id) {
                    await browser.bookmarks.removeTree(child.id);
                }
            }

            console.log(`[${new Date().toISOString()}] Cleared ${children.length} bookmark items`);
        }
        catch (error: any) {
            console.error(`[${new Date().toISOString()}] Clear bookmark tree error:`, error);
            await browser.notifications.create({
                type: "basic",
                iconUrl: iconLogo,
                title: browser.i18n.getMessage('removeAllBookmarks'),
                message: `${browser.i18n.getMessage('error')}：${error.message}`
            });
        }
    }

    /**
     * 在指定文件夹下创建书签树
     */
    async function createBookmarkTreeInFolder(bookmarkList: BookmarkInfo[] | undefined, folderId: string) {
        if (!bookmarkList) return;

        console.log(`[${new Date().toISOString()}] Creating bookmark tree in folder: ${folderId}, items count: ${bookmarkList.length}`);

        for (let bookmark of bookmarkList) {
            if (bookmark.url) {
                // 创建书签
                const createdBookmark = await browser.bookmarks.create({
                    parentId: folderId,
                    title: bookmark.title,
                    url: bookmark.url
                });
                console.log(`[${new Date().toISOString()}] Created bookmark: ${bookmark.title} (${bookmark.url})`);
            } else if (bookmark.children && bookmark.children.length > 0) {
                // 创建文件夹
                let newFolder = await browser.bookmarks.create({
                    parentId: folderId,
                    title: bookmark.title
                });
                console.log(`[${new Date().toISOString()}] Created folder: ${bookmark.title}`);
                // 递归创建子书签
                await createBookmarkTreeInFolder(bookmark.children, newFolder.id);
            }
        }
    }

    /**
     * 创建书签树（兼容旧版本）
     */
    async function createBookmarkTree(bookmarkList: BookmarkInfo[] | undefined) {
        if (!bookmarkList) return;

        console.log(`[${new Date().toISOString()}] Creating bookmark tree, items count: ${bookmarkList.length}`);

        // 获取书签根节点
        let bookmarkTree: BookmarkInfo[] = await browser.bookmarks.getTree();
        let rootId = bookmarkTree[0]?.id;
        if (!rootId) throw new Error("未找到书签根节点");

        for (let bookmark of bookmarkList) {
            if (bookmark.url) {
                // 创建书签
                await browser.bookmarks.create({
                    parentId: rootId,
                    title: bookmark.title,
                    url: bookmark.url
                });
            } else if (bookmark.children && bookmark.children.length > 0) {
                // 创建文件夹
                let newFolder = await browser.bookmarks.create({
                    parentId: rootId,
                    title: bookmark.title
                });
                // 递归创建子书签
                await createBookmarkTreeInFolder(bookmark.children, newFolder.id);
            }
        }
    }

    /**
     * 计算书签数量
     */
    function getBookmarkCount(bookmarkList: BookmarkInfo[] | undefined): number {
        let count = 0;
        if (!bookmarkList) return count;

        for (let bookmark of bookmarkList) {
            if (bookmark.url) {
                count++;
            } else if (bookmark.children) {
                count += getBookmarkCount(bookmark.children);
            }
        }
        return count;
    }

    /**
     * 刷新本地书签计数
     */
    async function refreshLocalCount() {
        try {
            console.log(`[${new Date().toISOString()}] Refreshing local bookmark count`);
            let bookmarks = await getToolbarBookmarks();
            let count = getBookmarkCount(formatBookmarks(bookmarks));
            await browser.storage.local.set({ localCount: count });
            console.log(`[${new Date().toISOString()}] Local bookmark count updated: ${count}`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] 刷新本地计数失败:`, error);
        }
    }

    /**
     * 格式化书签数据
     */
    function formatBookmarks(bookmarks: BookmarkInfo[]): BookmarkInfo[] | undefined {
        if (!bookmarks || bookmarks.length === 0) return undefined;

        let result: BookmarkInfo[] = [];
        for (let bookmark of bookmarks) {
            let formatted = format(bookmark);
            if (formatted) {
                result.push(formatted);
            }
        }
        return result;
    }

    /**
     * 格式化单个书签
     */
    function format(b: BookmarkInfo): BookmarkInfo | undefined {
        // 过滤掉根节点和特殊节点，但保留书签工具栏的内容
        if (b.id === "0" || b.id === "2" ||
            b.id === "root________" || b.id === "unfiled_____") {
            return undefined;
        }

        // 如果是书签工具栏本身，只返回其子内容
        if (b.id === "1" || b.id === "toolbar_____") {
            if (b.children && b.children.length > 0) {
                let children: BookmarkInfo[] = [];
                for (let child of b.children) {
                    let formattedChild = format(child);
                    if (formattedChild) {
                        children.push(formattedChild);
                    }
                }
                return children.length > 0 ? { children } : undefined;
            }
            return undefined;
        }

        let result: BookmarkInfo = {
            id: b.id,
            title: b.title,
            url: b.url,
            children: undefined
        };

        if (b.children && b.children.length > 0) {
            let children: BookmarkInfo[] = [];
            for (let child of b.children) {
                let formattedChild = format(child);
                if (formattedChild) {
                    children.push(formattedChild);
                }
            }
            if (children.length > 0) {
                result.children = children;
            }
        }

        return result;
    }
});