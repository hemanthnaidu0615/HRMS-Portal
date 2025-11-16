import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';

const { Title, Text, Link } = Typography;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (values: { email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(values);

      localStorage.setItem('token', response.token);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      localStorage.setItem('user', JSON.stringify({ id: response.id, email: response.email }));

      if (response.mustChangePassword) {
        navigate('/set-password', { state: { email: values.email } });
        return;
      }

      if (response.roles.includes('superadmin')) {
        navigate('/superadmin/organizations');
      } else if (response.roles.includes('orgadmin')) {
        navigate('/admin/employees');
      } else if (response.roles.includes('employee')) {
        navigate('/employee/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#dde4eb' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          margin: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: '#0a0d54',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Text strong style={{ color: '#fff', fontSize: 32 }}>HR</Text>
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>Enterprise HRMS</Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email address"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link onClick={() => navigate('/forgot-password')}>
                Forgot password?
              </Link>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
