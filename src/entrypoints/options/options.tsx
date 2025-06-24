import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
    Container, Row, Col, Nav, Tab, Form, Button, InputGroup, Card
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import 'bootstrap/dist/css/bootstrap.min.css';
import './options.css';
import optionsStorage from '../../utils/optionsStorage';

/**
 * 配置表单组件：支持 github 或 gitee
 */
const GistForm: React.FC<{ prefix: 'github' | 'gitee' }> = ({ prefix }) => {
    const { register } = useForm();

    useEffect(() => {
        optionsStorage.syncForm(`#formOptions-${prefix}`);
    }, [prefix]);

    const label = {
        token: prefix === 'github' ? 'GitHub Token' : 'Gitee Token',
        gistID: prefix === 'github' ? 'Gist ID' : 'Gitee Gist ID',
        fileName: 'Gist File Name',
        enableNotify: 'Enable Notify',
        help: prefix === 'github'
            ? 'https://github.com/dudor/BookmarkHub'
            : 'https://gitee.com/dudor/BookmarkHub'
    };

    return (
        <Form id={`formOptions-${prefix}`}>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{label.token}</Form.Label>
                <Col sm={9}>
                    <InputGroup size="sm">
                        <Form.Control
                            {...register(`${prefix}Token`)}
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
                        {...register(`${prefix}GistID`)}
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
                        {...register(`${prefix}GistFileName`)}
                        type="text"
                        placeholder="BookmarkHub"
                        size="sm"
                    />
                </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{label.enableNotify}</Form.Label>
                <Col sm={9}>
                    <Form.Check
                        {...register(`${prefix}EnableNotify`)}
                        type="switch"
                        id={`${prefix}EnableNotify`}
                    />
                </Col>
            </Form.Group>

            <Form.Group as={Row}>
                <Col sm={{ span: 9, offset: 3 }}>
                    <a href={label.help} target="_blank" rel="noreferrer">
                        Help & Docs
                    </a>
                </Col>
            </Form.Group>
        </Form>
    );
};

/**
 * 主组件：带导航和卡片容器
 */
const Popup: React.FC = () => {
    return (
        <Container fluid className="p-3">
            <Tab.Container defaultActiveKey="github">
                <Row>
                    {/* 左侧导航 */}
                    <Col sm={3}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="github">GitHub Gist</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="gitee">Gitee Gist</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>

                    {/* 右侧内容（卡片包裹） */}
                    <Col sm={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="github">
                                <Card className="shadow-sm rounded">
                                    <Card.Body>
                                        <GistForm prefix="github" />
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="gitee">
                                <Card className="shadow-sm rounded">
                                    <Card.Body>
                                        <GistForm prefix="gitee" />
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
        <Popup />
    </React.StrictMode>
);
