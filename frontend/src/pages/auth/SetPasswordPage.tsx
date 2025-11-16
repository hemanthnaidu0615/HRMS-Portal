import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Progress } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authApi } from '../../api/authApi';

/**
 * Premium Set Password Page
 * First-time password setup with strength indicator
 */
export const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [form] = Form.useForm();

  const email = location.state?.email;

  // Redirect if no email in state
  if (!email) {
    return <Navigate to="/login" replace />;
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ff4d4f';
    if (passwordStrength < 70) return '#faad14';
    return '#52c41a';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleSetPassword = async (values: {
    temporaryPassword: string;
    newPassword: string;
  }) => {
    setError('');
    setLoading(true);

    try {
      await authApi.setPassword({
        email,
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to set password. Please check your temporary password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Set Successfully">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircleOutlined
            style={{
              fontSize: 64,
              color: '#52c41a',
              marginBottom: 24,
            }}
          />
          <div style={{ fontSize: 16, color: '#64748b', marginBottom: 16 }}>
            Your password has been set successfully!
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>
            Redirecting to login page...
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set Your Password"
      subtitle="Create a strong password for your account"
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 24 }}
        />
      )}

      <Alert
        message="Welcome to HRMS Portal"
        description="For security reasons, please set a new password to continue."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        name="setPassword"
        onFinish={handleSetPassword}
        layout="vertical"
        size="large"
        requiredMark="optional"
      >
        <Form.Item
          name="temporaryPassword"
          label="Temporary Password"
          rules={[{ required: true, message: 'Please enter your temporary password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Enter temporary password from email"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Create a strong password"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* Password Strength Indicator */}
        {passwordStrength > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#64748b' }}>Password Strength:</span>
              <span style={{ color: getStrengthColor(), fontWeight: 500 }}>
                {getStrengthText()}
              </span>
            </div>
            <Progress
              percent={passwordStrength}
              strokeColor={getStrengthColor()}
              showInfo={false}
              size="small"
            />
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Re-enter your password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              height: 48,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Set Password & Continue
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default SetPasswordPage;
