import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';

/**
 * Premium Login Page
 * Modern, clean login experience
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(values);

      // Store authentication data
      localStorage.setItem('token', response.token);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      localStorage.setItem('user', JSON.stringify({ id: response.id, email: response.email }));

      // Handle password change requirement
      if (response.mustChangePassword) {
        navigate('/set-password', { state: { email: values.email } });
        return;
      }

      // Role-based navigation
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
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your HRMS account"
    >
      {error && (
        <Alert
          message="Login Failed"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        size="large"
        requiredMark="optional"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            icon={<LoginOutlined />}
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Sign In
          </Button>
        </Form.Item>

        <Divider plain style={{ margin: '16px 0' }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Need help?</span>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/forgot-password"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#0a0d54',
            }}
          >
            Forgot your password?
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default LoginPage;
