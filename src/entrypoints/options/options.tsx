import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
    Container, Row, Col, Nav, Tab, Form, Button, InputGroup, Card, Modal, Alert
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import 'bootstrap/dist/css/bootstrap.min.css';
import './options.css';
import optionsStorage from '../../utils/optionsStorage';
import { GistConfig } from '../../utils/setting';

/**
 * 单个Gist配置项组件
 */
const DEFAULT_NAMES = {
    github: 'Default GitHub Gist',
    gitee: 'Default Gitee Gist',
};

const GistConfigItem: React.FC<{
    config: GistConfig;
    prefix: 'github' | 'gitee';
    onUpdate: (config: GistConfig) => void;
    onDelete: (id: string) => void;
    isDefault: boolean;
}> = ({ config, prefix, onUpdate, onDelete, isDefault }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: config
    });

    const handleFormChange = (data: any) => {
        onUpdate({ ...config, ...data });
    };

    const label = {
        token: prefix === 'github' ? 'GitHub Token' : 'Gitee Token',
        gistID: prefix === 'github' ? 'Gist ID' : 'Gitee Gist ID',
        fileName: 'Gist File Name',
        folderName: 'Bookmark Folder Name',
        help: prefix === 'github'
            ? 'https://github.com/dudor/BookmarkHub'
            : 'https://gitee.com/dudor/BookmarkHub'
    };

    return (
        <div className="config-item">
            <div className="config-header">
                <div className="config-title">
                    {/* 名字输入框，默认配置禁用，其他可编辑 */}
                    <Form.Control
                        type="text"
                        value={config.name}
                        disabled={isDefault}
                        size="sm"
                        style={{ width: 'auto', display: 'inline-block', fontWeight: 600, background: isDefault ? '#f5f5f5' : undefined, border: isDefault ? 'none' : undefined }}
                        onChange={e => onUpdate({ ...config, name: e.target.value })}
                    />
                    {isDefault && (
                        <span className="badge bg-primary ms-2">Default</span>
                    )}
                </div>
                <div className="config-actions">
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(config.id)}
                        disabled={isDefault}
                        title={isDefault ? "Default configuration cannot be deleted" : "Delete configuration"}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <Form onChange={handleSubmit(handleFormChange)}>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>{label.token}</Form.Label>
                    <Col sm={9}>
                        <InputGroup size="sm">
                            <Form.Control
                                {...register('token')}
                                type="text"
                                placeholder={`${prefix} token`}
                            />
                            <InputGroup.Append>
                                <Button
                                    variant="outline-secondary"
                                    as="a"
                                    target="_blank"
                                    href={
                                        prefix === 'github'
                                            ? 'https://github.com/settings/tokens/new'
                                            : 'https://gitee.com/personal_access_tokens'
                                    }
                                >
                                    Get Token
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>{label.gistID}</Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            {...register('gistID')}
                            type="text"
                            placeholder={label.gistID}
                            size="sm"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>{label.fileName}</Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            {...register('gistFileName')}
                            type="text"
                            placeholder="BookmarkHub"
                            size="sm"
                        />
                    </Col>
                </Form.Group>

                {!isDefault && (
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>{label.folderName}</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                {...register('folderName')}
                                type="text"
                                placeholder="BookmarkHub"
                                size="sm"
                            />
                            <Form.Text className="text-muted">
                                This folder will be created under your bookmarks root if it doesn't exist.
                            </Form.Text>
                        </Col>
                    </Form.Group>
                )}

                <Form.Group as={Row}>
                    <Col sm={{ span: 9, offset: 3 }}>
                        <a href={label.help} target="_blank" rel="noreferrer" className="help-link">
                            Help & Docs
                        </a>
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );
};

/**
 * Gist配置管理组件
 */
const GistConfigManager: React.FC<{ prefix: 'github' | 'gitee' }> = ({ prefix }) => {
    const [configs, setConfigs] = useState<GistConfig[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    // 加载配置
    useEffect(() => {
        loadConfigs();
    }, [prefix]);

    const loadConfigs = async () => {
        const options = await optionsStorage.getAll();
        const configKey = `${prefix}Configs` as keyof typeof options;
        let configsData = (options[configKey] as unknown) as GistConfig[] || [];
        // 保证始终有一个默认配置
        if (!configsData.some(cfg => cfg.isDefault)) {
            configsData = [
                {
                    id: `${prefix}-default`,
                    name: DEFAULT_NAMES[prefix],
                    token: '',
                    gistID: '',
                    gistFileName: 'BookmarkHub',
                    folderName: '',
                    isDefault: true
                },
                ...configsData
            ];
        }
        // 保证默认配置名字和属性正确
        configsData = configsData.map((cfg, idx) =>
            idx === 0 ? {
                ...cfg,
                name: DEFAULT_NAMES[prefix],
                isDefault: true,
                folderName: '',
            } : { ...cfg, isDefault: false }
        );
        setConfigs(configsData);
    };

    // 保存配置到存储
    const saveConfigs = async (newConfigs: GistConfig[]) => {
        // 保证第一个为默认配置
        let configsToSave = newConfigs;
        if (!configsToSave.length || !configsToSave[0].isDefault) {
            configsToSave = [
                {
                    id: `${prefix}-default`,
                    name: DEFAULT_NAMES[prefix],
                    token: '',
                    gistID: '',
                    gistFileName: 'BookmarkHub',
                    folderName: '',
                    isDefault: true
                },
                ...configsToSave.filter(cfg => !cfg.isDefault)
            ];
        } else {
            configsToSave = configsToSave.map((cfg, idx) =>
                idx === 0 ? {
                    ...cfg,
                    name: DEFAULT_NAMES[prefix],
                    isDefault: true,
                    folderName: '',
                } : { ...cfg, isDefault: false }
            );
        }
        const options = await optionsStorage.getAll();
        const configKey = `${prefix}Configs` as keyof typeof options;
        (options as any)[configKey] = configsToSave;
        await optionsStorage.setAll(options);
        setConfigs(configsToSave);
    };

    // 更新配置
    const handleUpdateConfig = (updatedConfig: GistConfig) => {
        const newConfigs = configs.map(config =>
            config.id === updatedConfig.id ? updatedConfig : config
        );
        saveConfigs(newConfigs);
    };

    // 删除配置
    const handleDeleteConfig = (id: string) => {
        const configToDelete = configs.find(config => config.id === id);
        if (!configToDelete) return;
        // 不允许删除默认配置
        if (configToDelete.isDefault) {
            console.warn('Cannot delete default configuration');
            return;
        }
        // 不允许删除最后一个配置（始终保留默认配置）
        if (configs.length <= 1) return;
        const newConfigs = configs.filter(config => config.id !== id);
        saveConfigs(newConfigs);
    };

    // 添加新配置
    const handleAddConfig = (data: any) => {
        // 禁止添加与默认配置同名的配置
        if (data.name === DEFAULT_NAMES[prefix]) {
            alert('Cannot use the default configuration name.');
            return;
        }
        const newConfig: GistConfig = {
            id: `${prefix}-${Date.now()}`,
            name: data.name || 'New Configuration',
            token: '',
            gistID: '',
            gistFileName: 'BookmarkHub',
            folderName: 'BookmarkHub',
            isDefault: false
        };
        const newConfigs = [...configs, newConfig];
        saveConfigs(newConfigs);
        setShowAddModal(false);
        reset();
    };

    return (
        <div>
            {configs.map(config => (
                <GistConfigItem
                    key={config.id}
                    config={config}
                    prefix={prefix}
                    onUpdate={handleUpdateConfig}
                    onDelete={handleDeleteConfig}
                    isDefault={Boolean(config.isDefault)}
                />
            ))}

            <Button
                variant="outline-primary"
                className="add-config-btn"
                onClick={() => setShowAddModal(true)}
            >
                + Add New {prefix === 'github' ? 'GitHub' : 'Gitee'} Gist Configuration
            </Button>

            {/* 添加配置模态框 */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New {prefix === 'github' ? 'GitHub' : 'Gitee'} Gist Configuration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(handleAddConfig)}>
                        <Form.Group>
                            <Form.Label>Configuration Name</Form.Label>
                            <Form.Control
                                {...register('name', { required: true })}
                                type="text"
                                placeholder={`Enter ${prefix === 'github' ? 'GitHub' : 'Gitee'} configuration name`}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit(handleAddConfig)}>
                        Add Configuration
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

/**
 * 全局设置组件
 */
const GlobalSettings: React.FC = () => {
    const [activeProvider, setActiveProvider] = useState<'github' | 'gitee'>('github');
    const [enableNotify, setEnableNotify] = useState(true);

    useEffect(() => {
        loadGlobalSettings();
    }, []);

    const loadGlobalSettings = async () => {
        const options = await optionsStorage.getAll();
        setActiveProvider((options.activeProvider as 'github' | 'gitee') || 'github');
        setEnableNotify(Boolean(options.enableNotify));
    };

    const saveGlobalSettings = async () => {
        const options = await optionsStorage.getAll();
        (options as any).activeProvider = activeProvider;
        (options as any).enableNotify = enableNotify;
        await optionsStorage.setAll(options);
    };

    const handleProviderChange = (provider: 'github' | 'gitee') => {
        setActiveProvider(provider);
        saveGlobalSettings();
    };

    const handleNotifyChange = async (enabled: boolean) => {
        setEnableNotify(enabled);
        const options = await optionsStorage.getAll();
        (options as any).enableNotify = enabled;
        await optionsStorage.setAll(options);
    };

    const handleClearCache = async () => {
        if (window.confirm('Are you sure you want to clear all cache data? This will reset the extension to initial state.')) {
            try {
                // 清除所有存储数据
                await browser.storage.local.clear();
                await browser.storage.sync.clear();

                // 重新加载页面以应用更改
                window.location.reload();
            } catch (error: any) {
                console.error('Failed to clear cache:', error);
                alert('Failed to clear cache: ' + (error?.message || 'Unknown error'));
            }
        }
    };

    return (
        <Card className="shadow-sm rounded mb-4">
            <Card.Body>
                <h5 className="mb-4">Global Settings</h5>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>Active Provider</Form.Label>
                    <Col sm={9}>
                        <div className="d-flex gap-2">
                            <Button
                                variant={activeProvider === 'github' ? 'primary' : 'outline-primary'}
                                onClick={() => handleProviderChange('github')}
                            >
                                GitHub Gist
                            </Button>
                            <Button
                                variant={activeProvider === 'gitee' ? 'primary' : 'outline-primary'}
                                onClick={() => handleProviderChange('gitee')}
                            >
                                Gitee Gist
                            </Button>
                        </div>
                        <Form.Text className="text-muted">
                            Only one provider can be active at a time. All configurations of the active provider will be used for sync.
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>Enable Notifications</Form.Label>
                    <Col sm={9}>
                        <Form.Check
                            type="switch"
                            checked={enableNotify}
                            onChange={(e) => handleNotifyChange(e.target.checked)}
                            id="enableNotify"
                        />
                        <Form.Text className="text-muted">
                            Show notifications for sync operations.
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>Clear Cache</Form.Label>
                    <Col sm={9}>
                        <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={handleClearCache}
                        >
                            Clear All Cache Data
                        </Button>
                        <Form.Text className="text-muted">
                            Clear all stored data including counts and settings. This will reset the extension to initial state.
                        </Form.Text>
                    </Col>
                </Form.Group>
            </Card.Body>
        </Card>
    );
};

/**
 * 主组件：带导航和卡片容器
 */
const OptionsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'github' | 'gitee'>('github');

    return (
        <Container fluid className="p-3">
            <GlobalSettings />

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'github' | 'gitee')}>
                <Row>
                    {/* 左侧导航 */}
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="github">
                                    <i className="fab fa-github me-2"></i>
                                    GitHub Gist
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="gitee">
                                    <i className="fas fa-code-branch me-2"></i>
                                    Gitee Gist
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>

                    {/* 右侧内容（卡片包裹） */}
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="github">
                                <Card className="shadow-sm rounded">
                                    <Card.Body>
                                        <h5 className="mb-4">GitHub Gist Configurations</h5>
                                        <Alert variant="info">
                                            <strong>Note:</strong> All GitHub Gist configurations will be used for sync operations when GitHub is the active provider.
                                        </Alert>
                                        <GistConfigManager prefix="github" />
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="gitee">
                                <Card className="shadow-sm rounded">
                                    <Card.Body>
                                        <h5 className="mb-4">Gitee Gist Configurations</h5>
                                        <Alert variant="info">
                                            <strong>Note:</strong> All Gitee Gist configurations will be used for sync operations when Gitee is the active provider.
                                        </Alert>
                                        <GistConfigManager prefix="gitee" />
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <OptionsPage />
    </React.StrictMode>
);
