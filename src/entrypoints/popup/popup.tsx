/**
 * Popup.tsx - BookmarkHub 浏览器扩展的弹出窗口主界面
 * 
 * 这个文件定义了扩展弹出窗口的React组件，包含书签操作菜单和状态显示。
 * 使用了React、React-Bootstrap和React-Icons库来构建界面。
 */

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client';
import { Dropdown, Badge } from 'react-bootstrap'; // Bootstrap的下拉菜单和徽章组件
import { IconContext } from 'react-icons' // 用于统一设置图标样式
import {
    AiOutlineCloudUpload, AiOutlineCloudDownload,
    AiOutlineSetting, AiOutlineClear,
    AiOutlineInfoCircle, AiOutlineGithub,
    AiOutlineBook, AiOutlineCloud
} from 'react-icons/ai' // 从Ant Design图标库导入所需图标
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap基础样式
import './popup.css' // 引入自定义样式

/**
 * Popup组件 - 扩展的主界面组件
 */
const Popup: React.FC = () => {
    // 使用useState定义和初始化本地和远程书签计数状态
    const [count, setCount] = useState({ local: "0", remote: "0" })

    /**
     * useEffect处理点击事件
     * 监听文档上的点击事件，当下拉菜单项被点击时:
     * 1. 禁用按钮防止重复点击
     * 2. 发送消息到后台脚本处理相应操作
     * 3. 操作完成后重新启用按钮
     */
    useEffect(() => {
        document.addEventListener('click', (e: MouseEvent) => {
            let elem = e.target as HTMLInputElement;
            if (elem != null && elem.className === 'dropdown-item') {
                elem.setAttribute('disabled', 'disabled');
                browser.runtime.sendMessage({ name: elem.name })
                    .then((res) => {
                        elem.removeAttribute('disabled');
                        console.log("msg", Date.now())
                    })
                    .catch(c => {
                        console.log("error", c)
                    });
            }
        });
    }, []) // 空依赖数组表示只在组件挂载时执行一次

    /**
     * useEffect处理初始化数据
     * 从本地存储中获取书签计数并更新状态
     */
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const data = await browser.storage.local.get(["localCount", "remoteCount"]);
                setCount({
                    local: data.localCount?.toString() || "0", // 确保为字符串
                    remote: data.remoteCount?.toString() || "0"
                });
            } catch (error) {
                console.error("加载书签计数失败:", error);
                setCount({ local: "0", remote: "0" }); // 保持默认值
            }
        };
        loadCounts();
    }, []); // 空依赖数组表示只在组件挂载时执行一次

    /**
     * 渲染组件UI
     * 使用Dropdown.Menu创建下拉菜单，包含:
     * - 上传/下载/清空书签按钮
     * - 设置按钮
     * - 底部信息栏(帮助链接、书签计数、作者链接)
     */
    return (
        <IconContext.Provider value={{ className: 'dropdown-item-icon' }}>
            <Dropdown.Menu show>
                {/* 上传书签按钮 */}
                <Dropdown.Item name='upload' as="button" title={browser.i18n.getMessage('uploadBookmarksDesc')}>
                    <AiOutlineCloudUpload />
                    {browser.i18n.getMessage('uploadBookmarks')}
                </Dropdown.Item>

                {/* 下载书签按钮 */}
                <Dropdown.Item name='download' as="button" title={browser.i18n.getMessage('downloadBookmarksDesc')}>
                    <AiOutlineCloudDownload />
                    {browser.i18n.getMessage('downloadBookmarks')}
                </Dropdown.Item>

                {/* 清空书签按钮 */}
                <Dropdown.Item name='removeAll' as="button" title={browser.i18n.getMessage('removeAllBookmarksDesc')}>
                    <AiOutlineClear />
                    {browser.i18n.getMessage('removeAllBookmarks')}
                </Dropdown.Item>

                {/* 书签数量展示区 */}
                <Dropdown.ItemText className="count-display">
                    <span>
                        <AiOutlineBook className="dropdown-item-icon" />
                        {count.local}
                    </span>
                    <span>
                        <AiOutlineCloud className="dropdown-item-icon" />
                        {count.remote}
                    </span>
                </Dropdown.ItemText>


                <Dropdown.Divider /> {/* 分隔线 */}

                {/* 设置按钮 */}
                <Dropdown.Item name='setting' as="button">
                    <AiOutlineSetting />
                    {browser.i18n.getMessage('settings')}
                </Dropdown.Item>

                {/* 底部信息栏 */}
                <Dropdown.ItemText>
                    <AiOutlineInfoCircle />
                    <a href="https://github.com/dudor/BookmarkHub" target="_blank">
                        {browser.i18n.getMessage('help')}
                    </a>|
                    <a href="https://github.com/dudor" target="_blank" title={browser.i18n.getMessage('author')}>
                        <AiOutlineGithub />
                    </a>
                </Dropdown.ItemText>
            </Dropdown.Menu >
        </IconContext.Provider>
    )
}

/**
 * 将Popup组件渲染到DOM中
 * 使用React的严格模式来检查潜在问题
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);