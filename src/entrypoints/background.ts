import BookmarkService from '../utils/services'
import { Setting } from '../utils/setting'
import iconLogo from '../assets/icon.png'
import { OperType, BookmarkInfo, SyncDataInfo, RootBookmarksType, BrowserType } from '../utils/models'
import { Bookmarks } from 'wxt/browser'

// 定义后台脚本主入口
export default defineBackground(() => {

  // 扩展安装时的监听器
  browser.runtime.onInstalled.addListener(c => {
    // 可以在这里添加初始化逻辑
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
    // 上传书签到Gist
    if (msg.name === 'upload') {
      curOperType = OperType.SYNC
      uploadBookmarks().then(() => {
        curOperType = OperType.NONE
        browser.action.setBadgeText({ text: "" }); // 清除徽章
        refreshLocalCount(); // 刷新本地计数
        sendResponse(true); // 发送响应
      });
    }
    // 从Gist下载书签
    if (msg.name === 'download') {
      curOperType = OperType.SYNC
      downloadBookmarks().then(() => {
        curOperType = OperType.NONE
        browser.action.setBadgeText({ text: "" });
        refreshLocalCount();
        sendResponse(true);
      });
    }
    // 删除所有书签
    if (msg.name === 'removeAll') {
      curOperType = OperType.REMOVE
      clearBookmarkTree().then(() => {
        curOperType = OperType.NONE
        browser.action.setBadgeText({ text: "" });
        refreshLocalCount();
        sendResponse(true);
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
      browser.action.setBadgeText({ text: "!" }); // 显示修改标记
      browser.action.setBadgeBackgroundColor({ color: "#F00" }); // 红色背景
      refreshLocalCount(); // 刷新本地计数
    }
  });

  // 书签修改监听器
  browser.bookmarks.onChanged.addListener((id, info) => {
    if (curOperType === OperType.NONE) {
      browser.action.setBadgeText({ text: "!" });
      browser.action.setBadgeBackgroundColor({ color: "#F00" });
    }
  })

  // 书签移动监听器
  browser.bookmarks.onMoved.addListener((id, info) => {
    if (curOperType === OperType.NONE) {
      browser.action.setBadgeText({ text: "!" });
      browser.action.setBadgeBackgroundColor({ color: "#F00" });
    }
  })

  // 书签删除监听器
  browser.bookmarks.onRemoved.addListener((id, info) => {
    if (curOperType === OperType.NONE) {
      browser.action.setBadgeText({ text: "!" });
      browser.action.setBadgeBackgroundColor({ color: "#F00" });
      refreshLocalCount();
    }
  })

  /**
   * 上传书签到GitHub Gist
   * 1. 验证设置
   * 2. 获取当前书签
   * 3. 格式化同步数据
   * 4. 更新Gist
   * 5. 更新远程计数
   */
  async function uploadBookmarks() {
    try {
      // 获取配置信息
      let setting = await Setting.build()

      // 验证必要设置
      if (setting.githubToken == '') throw new Error("未找到Gist Token");
      if (setting.gistID == '') throw new Error("未找到Gist ID");
      if (setting.gistFileName == '') throw new Error("未找到Gist文件名");

      // 获取并格式化书签
      let bookmarks = await getBookmarks();
      let syncdata = new SyncDataInfo();
      syncdata.version = browser.runtime.getManifest().version; // 扩展版本
      syncdata.createDate = Date.now(); // 当前时间戳
      syncdata.bookmarks = formatBookmarks(bookmarks); // 格式化书签
      syncdata.browser = navigator.userAgent; // 浏览器信息

      // 更新GitHub Gist
      await BookmarkService.update({
        files: {
          [setting.gistFileName]: {
            content: JSON.stringify(syncdata) // JSON序列化
          }
        },
        description: setting.gistFileName
      });

      // 更新存储的远程计数
      const count = getBookmarkCount(syncdata.bookmarks);
      await browser.storage.local.set({ remoteCount: count });

      // 如果启用通知则显示成功消息
      if (setting.enableNotify) {
        await browser.notifications.create({
          type: "basic",
          iconUrl: iconLogo,
          title: browser.i18n.getMessage('uploadBookmarks'),
          message: browser.i18n.getMessage('success')
        });
      }
    }
    catch (error: any) {
      console.error(error);
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
   * 从Gist下载书签
   * 1. 获取Gist数据
   * 2. 验证数据有效性
   * 3. 清空现有书签
   * 4. 创建新书签树
   * 5. 更新远程计数
   */
  async function downloadBookmarks() {
    try {
      let gist = await BookmarkService.get();
      let setting = await Setting.build()
      if (gist) {
        let syncdata: SyncDataInfo = JSON.parse(gist);
        // 验证书签数据
        if (syncdata.bookmarks == undefined || syncdata.bookmarks.length == 0) {
          if (setting.enableNotify) {
            await browser.notifications.create({
              type: "basic",
              iconUrl: iconLogo,
              title: browser.i18n.getMessage('downloadBookmarks'),
              message: `${browser.i18n.getMessage('error')}：Gist文件 ${setting.gistFileName} 为空`
            });
          }
          return;
        }
        // 清空并重建书签
        await clearBookmarkTree();
        await createBookmarkTree(syncdata.bookmarks);
        // 更新计数
        const count = getBookmarkCount(syncdata.bookmarks);
        await browser.storage.local.set({ remoteCount: count });

        // 成功通知
        if (setting.enableNotify) {
          await browser.notifications.create({
            type: "basic",
            iconUrl: iconLogo,
            title: browser.i18n.getMessage('downloadBookmarks'),
            message: browser.i18n.getMessage('success')
          });
        }
      }
      else {
        // Gist不存在的错误处理
        await browser.notifications.create({
          type: "basic",
          iconUrl: iconLogo,
          title: browser.i18n.getMessage('downloadBookmarks'),
          message: `${browser.i18n.getMessage('error')}：未找到Gist文件 ${setting.gistFileName}`
        });
      }
    }
    catch (error: any) {
      console.error(error);
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
    let bookmarkTree: BookmarkInfo[] = await browser.bookmarks.getTree();
    // 根据根节点ID判断浏览器类型
    if (bookmarkTree && bookmarkTree[0].id === "root________") {
      curBrowserType = BrowserType.FIREFOX;
    }
    else {
      curBrowserType = BrowserType.CHROME;
    }
    return bookmarkTree;
  }

  /**
   * 清空书签树（保留根节点）
   */
  async function clearBookmarkTree() {
    try {
      let setting = await Setting.build()
      // 验证设置
      if (setting.githubToken == '') throw new Error("未找到Gist Token");
      if (setting.gistID == '') throw new Error("未找到Gist ID");
      if (setting.gistFileName == '') throw new Error("未找到Gist文件名");

      // 获取所有书签节点
      let bookmarks = await getBookmarks();
      let tempNodes: BookmarkInfo[] = [];
      // 收集所有子节点
      bookmarks[0].children?.forEach(c => {
        c.children?.forEach(d => {
          tempNodes.push(d)
        })
      });

      // 递归删除所有子节点
      if (tempNodes.length > 0) {
        for (let node of tempNodes) {
          if (node.id) {
            await browser.bookmarks.removeTree(node.id)
          }
        }
      }

      // 如果是删除操作且启用通知，显示成功消息
      if (curOperType === OperType.REMOVE && setting.enableNotify) {
        await browser.notifications.create({
          type: "basic",
          iconUrl: iconLogo,
          title: browser.i18n.getMessage('removeAllBookmarks'),
          message: browser.i18n.getMessage('success')
        });
      }
    }
    catch (error: any) {
      console.error(error);
      // 错误通知
      await browser.notifications.create({
        type: "basic",
        iconUrl: iconLogo,
        title: browser.i18n.getMessage('removeAllBookmarks'),
        message: `${browser.i18n.getMessage('error')}：${error.message}`
      });
    }
  }

  /**
   * 创建书签树
   * @param bookmarkList 书签列表
   */
  async function createBookmarkTree(bookmarkList: BookmarkInfo[] | undefined) {
    if (bookmarkList == null) return;

    for (let i = 0; i < bookmarkList.length; i++) {
      let node = bookmarkList[i];
      // 处理特殊文件夹（书签栏/菜单/其他等）
      if (node.title == RootBookmarksType.MenuFolder
        || node.title == RootBookmarksType.MobileFolder
        || node.title == RootBookmarksType.ToolbarFolder
        || node.title == RootBookmarksType.UnfiledFolder) {

        // 根据浏览器类型设置正确的parentId
        if (curBrowserType == BrowserType.FIREFOX) {
          switch (node.title) {
            case RootBookmarksType.MenuFolder:
              node.children?.forEach(c => c.parentId = "menu________");
              break;
            case RootBookmarksType.MobileFolder:
              node.children?.forEach(c => c.parentId = "mobile______");
              break;
            case RootBookmarksType.ToolbarFolder:
              node.children?.forEach(c => c.parentId = "toolbar_____");
              break;
            case RootBookmarksType.UnfiledFolder:
              node.children?.forEach(c => c.parentId = "unfiled_____");
              break;
            default:
              node.children?.forEach(c => c.parentId = "unfiled_____");
              break;
          }
        } else {
          // Chrome的parentId
          switch (node.title) {
            case RootBookmarksType.MobileFolder:
              node.children?.forEach(c => c.parentId = "3");
              break;
            case RootBookmarksType.ToolbarFolder:
              node.children?.forEach(c => c.parentId = "1");
              break;
            case RootBookmarksType.UnfiledFolder:
            case RootBookmarksType.MenuFolder:
              node.children?.forEach(c => c.parentId = "2");
              break;
            default:
              node.children?.forEach(c => c.parentId = "2");
              break;
          }
        }
        // 递归创建子书签
        await createBookmarkTree(node.children);
        continue;
      }

      // 创建书签节点
      let res: Bookmarks.BookmarkTreeNode = { id: '', title: '' };
      try {
        // 处理特殊URL可能导致的错误
        res = await browser.bookmarks.create({
          parentId: node.parentId,
          title: node.title,
          url: node.url
        });
      } catch (err) {
        console.error(res, err);
      }
      // 递归创建子书签
      if (res.id && node.children && node.children.length > 0) {
        node.children.forEach(c => c.parentId = res.id);
        await createBookmarkTree(node.children);
      }
    }
  }

  /**
   * 计算书签数量
   * @param bookmarkList 书签列表
   * @returns 书签总数
   */
  function getBookmarkCount(bookmarkList: BookmarkInfo[] | undefined) {
    let count = 0;
    if (bookmarkList) {
      bookmarkList.forEach(c => {
        if (c.url) {
          count++; // 如果是URL书签则计数
        }
        else {
          // 如果是文件夹则递归计数
          count = count + getBookmarkCount(c.children);
        }
      });
    }
    return count;
  }

  /**
   * 刷新本地书签计数
   */
  async function refreshLocalCount() {
    let bookmarkList = await getBookmarks();
    console.log('bookmarkList 完整信息:', JSON.stringify(bookmarkList, null, 2));
    const count = getBookmarkCount(bookmarkList);
    await browser.storage.local.set({ localCount: count });
  }

  /**
   * 格式化书签数据（移除不需要同步的字段）
   * @param bookmarks 原始书签数据
   * @returns 格式化后的书签数据
   */
  function formatBookmarks(bookmarks: BookmarkInfo[]): BookmarkInfo[] | undefined {
    // 重命名特殊文件夹
    if (bookmarks[0].children) {
      for (let a of bookmarks[0].children) {
        switch (a.id) {
          case "1":
          case "toolbar_____":
            a.title = RootBookmarksType.ToolbarFolder; // 书签栏
            break;
          case "menu________":
            a.title = RootBookmarksType.MenuFolder; // 菜单
            break;
          case "2":
          case "unfiled_____":
            a.title = RootBookmarksType.UnfiledFolder; // 其他书签
            break;
          case "3":
          case "mobile______":
            a.title = RootBookmarksType.MobileFolder; // 移动设备
            break;
        }
      }
    }

    // 格式化根节点
    let a = format(bookmarks[0]);
    return a.children;
  }

  /**
   * 格式化单个书签节点（移除临时字段）
   * @param b 书签节点
   * @returns 格式化后的节点
   */
  function format(b: BookmarkInfo): BookmarkInfo {
    // 移除不需要同步的字段
    b.dateAdded = undefined;
    b.dateGroupModified = undefined;
    b.id = undefined;
    b.index = undefined;
    b.parentId = undefined;
    b.type = undefined;
    b.unmodifiable = undefined;

    // 递归格式化子节点
    if (b.children && b.children.length > 0) {
      b.children?.map(c => format(c))
    }
    return b;
  }
});