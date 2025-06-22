/**
 * Popup.tsx - BookmarkHub 浏览器扩展的弹出窗口主界面
 * 
 * 这个文件定义了扩展弹出窗口的React组件，包含书签操作菜单和状态显示。
 * 使用了React、React-Bootstrap和React-Icons库来构建界面。
 */

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client';
import { Dropdown } from 'react-bootstrap'; // Bootstrap的下拉菜单、徽章组件
import { IconContext } from 'react-icons' // 用于统一设置图标样式
import {
    AiOutlineCloudUpload, AiOutlineCloudDownload,
    AiOutlineSetting, AiOutlineClear,
    AiOutlineInfoCircle, AiOutlineGithub,
    AiOutlineBook, AiOutlineCloud, AiOutlineFolder
} from 'react-icons/ai' // 从Ant Design图标库导入所需图标
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap基础样式
import './popup.css' // 引入自定义样式

/**
 * Popup组件 - 扩展的主界面组件
 */
const Popup: React.FC = () => {
    // local 是本地书签数，remote 是远程书签数
    // count 相当于是一个 map，可以用来获取 key 的值
    // setCount 相当于一个回调函数，可以用来设置 key 的值
    const [count, setCount] = useState({ local: "0", remote: "0" })

    /**
     * useEffect 处理点击事件
     * 监听插件使用界面上的点击事件，当使用界面的下拉菜单项被点击时:
     * 1. 禁用按钮防止重复点击
     * 2. 发送消息到后台脚本处理相应操作
     * 3. 操作完成后重新启用按钮
     */
    useEffect(() => {
        document.addEventListener('click', (e: MouseEvent) => {
            let elem = e.target as HTMLInputElement;
            // 仅获取 class 为 dropdown-item  的元素
            if (elem != null && elem.className === 'dropdown-item') {
                elem.setAttribute('disabled', 'disabled');
                browser.runtime.sendMessage({ name: elem.name })
                    .then((res) => {
                        // 调用成功则移除禁用标签
                        elem.removeAttribute('disabled');
                        console.log("msg", Date.now())
                    })
                    .catch(c => {
                        // 调用失败则会一直禁用
                        console.log("error", c)
                    });
            }
        });
    }, []) // 空依赖数组表示只在组件挂载时执行一次，数组中填入执行的时机

    /**
     * useEffect 处理初始化数据
     * 从本地存储中获取书签计数并更新状态
     */
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const data = await browser.storage.local.get(["localCount", "remoteCount"]);
                setCount({
                    local: data.localCount?.toString() || "0",
                    remote: data.remoteCount?.toString() || "0"
                });
            } catch (error) {
                console.error("加载书签计数失败:", error);
                setCount({ local: "0", remote: "0" }); // 保持默认值
            }
        };
        loadCounts();
    }, []);

    /**
     * 渲染组件 UI
     * 使用 Dropdown.Menu 创建下拉菜单，包含:
     * - 上传/下载/清空书签按钮
     * - 设置按钮
     * - 底部信息栏(帮助链接)
     */
    return (
        <IconContext.Provider value={{ className: 'dropdown-item-icon' }}>
            {/* 下拉菜单，下面的内容都会添加上 dropdown-item 的 class */}
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
                    <span id="localCount" title={browser.i18n.getMessage('localCount')}>
                        <AiOutlineBook />
                        {count.local}
                    </span>

                    <span id="remoteCount" title={browser.i18n.getMessage('remoteCount')}>
                        <AiOutlineCloud />
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
                    <AiOutlineInfoCircle /><a href="https://github.com/dudor/BookmarkHub" target="_blank">{browser.i18n.getMessage('help')}</a>
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