import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Spin } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  GoogleOutlined,
  WindowsOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  SafetyOutlined,
} from '@ant-design/icons';
import { authApi } from '../../api/authApi';
import styles from './LoginPage.module.css';

/**
 * Premium Login Page
 * Full-screen split layout with animated gradient and glass morphism
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string; remember?: boolean }) => {
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

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
    <div className={styles.loginContainer}>
      {/* Left Side - Gradient Branding */}
      <div className={styles.brandingSide}>
        <div className={styles.logo}>HR</div>
        <div className={styles.brandingContent}>
          <h1 className={styles.brandingTitle}>HRMS Portal</h1>
          <p className={styles.brandingSubtitle}>
            Enterprise Human Resource Management System
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <ThunderboltFilled />
            </div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>Fast & Efficient</div>
              <div className={styles.featureDesc}>Streamline your HR processes</div>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <SafetyOutlined />
            </div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>Secure & Reliable</div>
              <div className={styles.featureDesc}>Enterprise-grade security</div>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <CheckCircleFilled />
            </div>
            <div className={styles.featureText}>
              <div className={styles.featureTitle}>Complete Solution</div>
              <div className={styles.featureDesc}>All-in-one HR management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Welcome Back</h2>
              <p className={styles.formSubtitle}>Sign in to access your account</p>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <div
                  style={{
                    background: '#fff1f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#cf1322',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className={styles.socialButtons}>
              <button className={styles.socialButton} type="button">
                <GoogleOutlined style={{ fontSize: 18, color: '#EA4335' }} />
                <span>Google</span>
              </button>
              <button className={styles.socialButton} type="button">
                <WindowsOutlined style={{ fontSize: 18, color: '#00A4EF' }} />
                <span>Microsoft</span>
              </button>
            </div>

            <div className={styles.divider}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 500, color: '#334155' }}>Email Address</span>}
                rules={[
                  { required: true, message: 'Please enter your email address' },
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="you@company.com"
                  autoComplete="email"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 15,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 500, color: '#334155' }}>Password</span>}
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 15,
                  }}
                />
              </Form.Item>

              <div className={styles.rememberRow}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: 14 }}>Remember me</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className={styles.submitButton}
                  icon={loading ? <Spin size="small" /> : <LoginOutlined />}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()} HRMS Portal. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
