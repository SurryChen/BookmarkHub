/**
 * options.tsx - BookmarkHub 扩展的选项设置页面
 * 提供用户配置界面，用于设置GitHub Token、Gist ID等参数
 */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Container, Form, Button, Col, Row, InputGroup } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import 'bootstrap/dist/css/bootstrap.min.css';
import './options.css';
import optionsStorage from '../../utils/optionsStorage';

/**
 * Popup组件 - 渲染选项页面的主组件
 * 使用React-Bootstrap构建响应式表单布局
 */
const Popup: React.FC = () => {
    const { register } = useForm();

    /**
     * 初始化表单数据
     * 组件挂载时从存储中同步配置到表单
     */
    useEffect(() => {
        optionsStorage.syncForm('#formOptions');
    }, []);

    return (
        <Container>
            {/**
             * 主表单容器
             * @type {HTMLFormElement}
             * @id formOptions - 用于optionsStorage同步数据
             */}
            <Form id='formOptions' name='formOptions'>

                {/**
                 * GitHub Token输入组
                 * 包含输入框和获取Token的按钮链接
                 */}
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>
                        {browser.i18n.getMessage('githubToken')}
                    </Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <InputGroup size="sm">
                            <Form.Control
                                {...register("githubToken")}
                                type="text"
                                placeholder="github token"
                                size="sm"
                            />
                            <InputGroup.Append>
                                <Button
                                    variant="outline-secondary"
                                    as="a"
                                    target="_blank"
                                    href="https://github.com/settings/tokens/new"
                                    size="sm"
                                >
                                    Get Token
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Form.Group>

                {/**
                 * Gist ID配置组
                 * 用于存储用户指定的Gist存储库ID
                 */}
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>
                        {browser.i18n.getMessage('gistID')}
                    </Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Control
                            {...register("gistID")}
                            type="text"
                            placeholder="gist ID"
                            size="sm"
                        />
                    </Col>
                </Form.Group>

                {/**
                 * Gist文件名配置组
                 * 指定Gist中用于存储书签的文件名
                 */}
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>
                        {browser.i18n.getMessage('gistFileName')}
                    </Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Control
                            {...register("gistFileName")}
                            type="text"
                            placeholder="gist file name"
                            size="sm"
                        />
                    </Col>
                </Form.Group>

                {/**
                 * 通知开关组
                 * 控制是否启用操作完成通知
                 */}
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}>
                        {browser.i18n.getMessage('enableNotifications')}
                    </Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <Form.Check
                            {...register("enableNotify")}
                            type="switch"
                            id="enableNotify"
                        />
                    </Col>
                </Form.Group>

                {/**
                 * 帮助链接组
                 * 提供项目文档的快速访问
                 */}
                <Form.Group as={Row}>
                    <Form.Label column="sm" sm={3} lg={2} xs={3}></Form.Label>
                    <Col sm={9} lg={10} xs={9}>
                        <a href="https://github.com/dudor/BookmarkHub" target="_blank">
                            {browser.i18n.getMessage('help')}
                        </a>
                    </Col>
                </Form.Group>
            </Form>
        </Container>
    );
};

/**
 * 渲染入口函数
 * 将主组件挂载到DOM的root节点
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);