import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/v1/login', {
                username: values.username,
                password: values.password,
            });
            localStorage.setItem('token', response.data.token);
            message.success('Login successful!');
            navigate('/');
        } catch (err: any) {
            message.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full bg-gray-100">
            <Card
                className="rounded-lg shadow-md px-8 py-4"
                style={{ width: 480 }} // Fixed width for the card
                title={<Title level={3} className="text-center m-0">Login to aigentools</Title>}
            >
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Log in
                        </Button>
                    </Form.Item>
                    <Form.Item className="text-center mb-0">
                        Or <a onClick={() => navigate('/register')}>register now!</a>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
